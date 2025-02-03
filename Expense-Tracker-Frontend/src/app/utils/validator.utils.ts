import { ValidatorFn, AbstractControl } from "@angular/forms";


export function PasswordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const passwordControl = control.get(password);
    const confirmPasswordControl = control.get(confirmPassword);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }
    const passwordValue = passwordControl.value;
    const confirmPasswordValue = confirmPasswordControl.value;

    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return null;
    }

    if (passwordValue !== confirmPasswordValue) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPasswordControl.errors) {
        const { passwordMismatch, ...otherErrors } = confirmPasswordControl.errors;
        confirmPasswordControl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      } else {
        confirmPasswordControl.setErrors(null);
      }
    }

    return null;
  };
}
