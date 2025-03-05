import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService, ApiService, EventService } from '@services';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);

  protected form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });
  protected userDetails = computed(() => this.event.userDetails());
  protected editing = signal<boolean>(false);
  protected profile_pic = signal<{ file: File | undefined, url: string }>({ file: undefined, url: '' });

  constructor() {
    effect(() => {
      const _userDetails = this.userDetails();
      if (_userDetails) {
        this.form.patchValue(_userDetails);
      }
    });
  }

  protected handleImageUpload(file: any) {
    const img: File = file.target.files[0];
    if (img && this.checkType(img)) {
      this.profile_pic.set({ file: img, url: URL.createObjectURL(img) })
    }
  }

  private checkType(file: File) {
    return file.type.split('/')[0] === 'image' ? true : false;
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  protected save(form: FormGroup) {
    const _userDetails = this.userDetails()!;
    const _profile_pic = this.profile_pic();
    const _form = form.value;
    let isValid: boolean = _userDetails?.name !== _form.name;
    !isValid && (isValid = !!_profile_pic.file);

    if (isValid) {
      const formData = new FormData();
      _profile_pic.file && formData.append('image', _profile_pic.file);
      Object.keys(_form).forEach((key) => {
        formData.append(key, _form[key]);
      })
      this.api.put(`api/user/update/${_userDetails._id}`, formData).subscribe({
        next: (res:any) => {
          this.alert.toast("Profile updated successfully!",'success');
          this.event.userDetails.set({...res.data, role: res.data.role.roleDisplayName});
        },
        error: (err) => {
          console.error("err: ", err);
          this.alert.toast(err.message || "Something went wrong!", 'error');
        },
      });
    }

    this.editing.set(false);
    this.profile_pic.set({ file: undefined, url: '' });
  }
}
