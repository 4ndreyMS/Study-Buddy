import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import { RegisterService } from './register.service';

// Imports nuevos
import { ExtraUserInfoService } from 'app/entities/extra-user-info/service/extra-user-info.service';
import { UserVotesService } from '../../entities/user-votes/service/user-votes.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('login', { static: false })
  login?: ElementRef;

  doNotMatch = false;
  error = false;
  errorEmailExists = false;
  errorUserExists = false;
  success = false;

  // En caso de querer poner esta validacion en otros
  // Poner esto:  checkboxControl: FormControl<boolean | null>;

  registerForm = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254)],
    }),
    degree: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254)],
    }),
    birthDay: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),

    checkboxControl: new FormControl(false, Validators.requiredTrue),
  });

  // , private extraUserInfoService: ExtraUserInfoService
  constructor(
    private translateService: TranslateService,
    private registerService: RegisterService,
    private extraUserInfoService: ExtraUserInfoService,
    private userVotesService: UserVotesService,
    public router: Router
  ) {}

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
  }

  register(): void {
    this.doNotMatch = false;
    this.error = false;
    this.errorEmailExists = false;
    this.errorUserExists = false;

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch = true;
    } else {
      const { login, email, phone, degree, birthDay } = this.registerForm.getRawValue();
      console.log(this.registerForm.getRawValue());

      // Foto por defecto de perfil
      const profilePicture =
        'https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-11639786938sxvzj5ogua.png';

      this.registerService
        .save({ login, email, password, langKey: this.translateService.currentLang, phone, degree, profilePicture, birthDay })
        .subscribe({ next: () => (this.success = true), error: response => this.processError(response) })
        .add(() => {
          this.userVotesService.createByUser(login).subscribe();
          if (this.success == true) {
            Swal.fire({
              icon: 'success',
              title: 'Registrado correctamente',
              text: 'Por favor, revise su correo electrónico para activar la cuenta.',
              showConfirmButton: true,
            });
            this.router.navigate(['login']);
          }
        });
    }
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists = true;
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists = true;
    } else {
      this.error = true;
    }
  }

  // Registra la información extra del usuario en la base de datos.
  private registerExtraInfo(pPhone: String, pDegree: String, pBirthDay: any, pLogin: any): void {
    // Cambiar foto default de perfil URL
    const newCustomExtraUserInfo = {
      phone: pPhone,
      degree: pDegree,
      profilePicture: 'profile.png',
      birthDay: pBirthDay,
      score: 0,
      userVotes: 0,
      user: pLogin,
    };
    console.log('Objeto newCustomExtraUserInfo: ' + newCustomExtraUserInfo);
    this.extraUserInfoService.create(newCustomExtraUserInfo);
  }
}
