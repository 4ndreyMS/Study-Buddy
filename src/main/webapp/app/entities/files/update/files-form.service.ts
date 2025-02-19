import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { IFiles, NewFiles } from '../files.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFiles for edit and NewFilesFormGroupInput for create.
 */
type FilesFormGroupInput = IFiles | PartialWithRequiredKeyOf<NewFiles>;

type FilesFormDefaults = Pick<NewFiles, 'id'>;

type FilesFormGroupContent = {
  id: FormControl<IFiles['id'] | NewFiles['id']>;
  type: FormControl<IFiles['type']>;
  url1: FormControl<IFiles['url1']>;
  url2: FormControl<IFiles['url2']>;
  url3: FormControl<IFiles['url3']>;
  status: FormControl<IFiles['status']>;
  name: FormControl<IFiles['name']>;
  excerpt: FormControl<IFiles['excerpt']>;
  publishDate: FormControl<IFiles['publishDate']>;
  section: FormControl<IFiles['section']>;
};

export type FilesFormGroup = FormGroup<FilesFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FilesFormService {
  createFilesFormGroup(files: FilesFormGroupInput = { id: null }): FilesFormGroup {
    const filesRawValue = {
      ...this.getFormDefaults(),
      ...files,
    };
    return new FormGroup<FilesFormGroupContent>({
      id: new FormControl(
        { value: filesRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      type: new FormControl(filesRawValue.type),
      url1: new FormControl(filesRawValue.url1),
      url2: new FormControl(filesRawValue.url2),
      url3: new FormControl(filesRawValue.url3),
      status: new FormControl(filesRawValue.status),
      name: new FormControl(filesRawValue.name),
      excerpt: new FormControl(filesRawValue.excerpt),
      publishDate: new FormControl(filesRawValue.publishDate),
      section: new FormControl(filesRawValue.section),
    });
  }

  getFiles(form: FilesFormGroup): IFiles | NewFiles {
    return form.getRawValue() as IFiles | NewFiles;
  }

  resetForm(form: FilesFormGroup, files: FilesFormGroupInput): void {
    const filesRawValue = { ...this.getFormDefaults(), ...files };
    form.reset(
      {
        ...filesRawValue,
        id: { value: filesRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): FilesFormDefaults {
    return {
      id: null,
    };
  }
}
