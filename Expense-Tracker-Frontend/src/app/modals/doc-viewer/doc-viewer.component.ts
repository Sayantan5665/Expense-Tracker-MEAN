import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MiddleEllipsisDirective } from '@directives';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@Component({
  selector: 'app-doc-viewer',
  imports: [NgxDocViewerModule, NgOptimizedImage, MatDialogModule, MatIconModule, MiddleEllipsisDirective],
  templateUrl: './doc-viewer.component.html',
  styleUrl: './doc-viewer.component.scss'
})
export class DocViewerDialog {
  readonly dialogRef = inject(MatDialogRef<DocViewerDialog>);
  private readonly document = inject(DOCUMENT);
  protected data:{url:string, name:string, fileType?:"doc" | "image" | "video" | "pdf" | "other"} = inject(MAT_DIALOG_DATA);


  private readonly DOC_EXTENSIONS = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'];
  private readonly IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'apng', 'avif'];
  private readonly VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv'];
  protected fileType = signal<'doc' | 'image' | 'video' | 'pdf' | 'other'>('doc');
  // protected showPDFloadingMsg = signal<boolean>(true);
  // protected showPDFerrorMsg = signal<boolean>(false);

  constructor() {
    if (this.data?.url?.length) {
      this.downloadOpen(this.data.url, this.data?.name || '');
    }
  }

  protected downloadOpen(url: string, name: string): void {
    if(this.data?.fileType?.length) {
      this.fileType.set(this.data.fileType);
    } else {
      if (!name.length) {
        this.download(url, '');
        return;
      }

      const extension = (name.split('.').pop() || '').toLowerCase();
      if (this.DOC_EXTENSIONS.includes(extension)) {
        this.fileType.set('doc');
      } else if (this.IMAGE_EXTENSIONS.includes(extension)) {
        this.fileType.set('image');
      } else if (this.VIDEO_EXTENSIONS.includes(extension)) {
        this.fileType.set('video');
      } else if(extension == 'pdf') {
        this.fileType.set('pdf');
      } else {
        this.fileType.set('other');
        this.download(url, name);
      }
    }
  }


  protected async download(url: string, name: string): Promise<void> {
    const fileType = this.fileType();
    if (['image', 'video', 'pdf'].includes(fileType)) {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      this.triggerDownload(objectURL, name);
      URL.revokeObjectURL(objectURL);
    } else {
      this.triggerDownload(url);
    }
  }

  private triggerDownload(url: string, name = ''): void {
    const link = this.document.createElement('a');
    link.href = url;
    if (name) {
      link.download = name;
    }
    link.click();
  }

  protected close() {
    this.dialogRef.close();
  }
}
