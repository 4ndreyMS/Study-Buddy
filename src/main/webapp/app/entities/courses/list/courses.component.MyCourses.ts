import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, filter, finalize, Observable, switchMap, tap } from 'rxjs';

import { ASC, DEFAULT_SORT_DATA, DESC, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ExtraUserInfoService } from 'app/entities/extra-user-info/service/extra-user-info.service';
import { EntityResponseType } from 'app/entities/news/service/news.service';
import { SortService } from 'app/shared/sort/sort.service';
import { ICourses } from '../courses.model';
import { CoursesDeleteDialogComponent } from '../delete/courses-delete-dialog.component';
import { CoursesService, EntityArrayResponseType } from '../service/courses.service';
import { CoursesFormGroup, CoursesFormService } from '../update/courses-form.service';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'jhi-courses',
  templateUrl: './courses.component.MyCourses.html',
  styleUrls: ['./courses.css'],
})
export class CoursesComponentMyCourses implements OnInit {
  courses?: ICourses[];
  isSaving = false;
  currentCourse: any = {};
  sections: any = ['init'];
  courses2: any;

  isLoading = false;
  ownerName: string = '';
  predicate = 'id';
  ascending = true;
  editForm: CoursesFormGroup = this.coursesFormService.createCoursesFormGroup();
  previewURL: string = '';
  idUser: number = 0;
  coursesLength = 0;
  courseResponse: any = {};
  constructor(
    protected coursesService: CoursesService,
    protected activatedRoute: ActivatedRoute,
    public router: Router,
    protected coursesFormService: CoursesFormService,
    private titleService: Title,

    protected sortService: SortService,
    protected modalService: NgbModal,
    protected extraUser: ExtraUserInfoService
  ) {}

  trackId = (_index: number, item: ICourses): number => this.coursesService.getCoursesIdentifier(item);

  ngOnInit(): void {
    this.titleService.setTitle('Cursos Creados');

    this.extraUser.getInfoByCurrentUser().subscribe({
      next: (res: EntityResponseType) => {
        // @ts-ignore
        this.idUser = res.body?.user.id;
        const login = res.body?.user?.login;
        if (login != null) {
          this.ownerName = login;
        }
        this.load();
      },
    });
  }

  saveUrl(URL: string): void {
    this.previewURL = URL;
  }
  previousState(): void {
    window.history.back();
  }

  enrolled(idCourse: ICourses): void {
    this.isSaving = true;

    if (idCourse.id !== null) {
      idCourse.users?.push({ id: this.idUser, login: this.ownerName });
      this.subscribeToSaveResponse(this.coursesService.update(idCourse));
    }
  }
  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICourses>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: e => this.onSaveError(e),
    });
  }
  protected onSaveSuccess(): void {
    // TODO: Agregar sweetAlert
  }

  protected onSaveError(e: any): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected findOwnerName(ownerName: string) {
    if (ownerName != null) {
      this.coursesService.findOwner(ownerName);
    }
  }

  delete(courses: ICourses): void {
    courses.status = 'innactive';
    Swal.fire({
      title: '¿Está seguro que desea borrar el curso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí!',
    }).then(result => {
      if (result.isConfirmed) {
        this.coursesService.partialUpdate(courses).subscribe();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado correctamente',
          showConfirmButton: true,
          timer: 3000,
        }).then(result => {
          if (result.isConfirmed) {
            this.load();
          }
        });
      }
    });
  }

  load(): void {
    this.loadFromBackendWithRouteInformations().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(): void {
    this.handleNavigation(this.predicate, this.ascending);
  }

  protected loadFromBackendWithRouteInformations(): Observable<EntityArrayResponseType> {
    return combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data]).pipe(
      tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
      switchMap(() => this.queryBackend(this.predicate, this.ascending))
    );
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const sort = (params.get(SORT) ?? data[DEFAULT_SORT_DATA]).split(',');
    this.predicate = sort[0];
    this.ascending = sort[1] === ASC;
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.courses = this.refineData(dataFromBody);
    this.courses = this.courses.filter(course => course.status === 'active');
  }

  protected refineData(data: ICourses[]): ICourses[] {
    return data.sort(this.sortService.startSort(this.predicate, this.ascending ? 1 : -1));
  }

  protected fillComponentAttributesFromResponseBody(data: ICourses[] | null): ICourses[] {
    return data ?? [];
  }

  protected queryBackend(predicate?: string, ascending?: boolean): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject = {
      eagerload: true,
      sort: this.getSortQueryParam(predicate, ascending),
    };
    return this.coursesService.getByOwner(this.ownerName).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(predicate?: string, ascending?: boolean): void {
    const queryParamsObj = {
      sort: this.getSortQueryParam(predicate, ascending),
    };

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,

      queryParams: queryParamsObj,
    });
  }

  protected getSortQueryParam(predicate = this.predicate, ascending = this.ascending): string[] {
    const ascendingQueryParam = ascending ? ASC : DESC;
    if (predicate === '') {
      return [];
    } else {
      return [predicate + ',' + ascendingQueryParam];
    }
  }
}
