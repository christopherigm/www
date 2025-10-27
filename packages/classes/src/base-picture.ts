import { Signal, signal } from '@preact-signals/safe-react';
import CommonFields from './common-fields';
import BaseAPIClass from './base-class';
import type {
  GenericImageProps,
  objectFit,
} from '@repo/ui/generic-image/generic-image';

export class BasePicture extends BaseAPIClass {
  public static instance: BasePicture;
  public type: string = 'BasePicture';
  public endpoint = '';
  public attributes: BasePictureAttributes = new BasePictureAttributes();
  public relationships: any;

  public static getInstance(): BasePicture {
    return BasePicture.instance || new BasePicture();
  }

  public getGenericPicture(): GenericImageProps {
    const newItem: GenericImageProps = {
      id: this.id,
      img_picture: this.attributes.img_picture,
      ...(this.attributes &&
        this.attributes.name && {
          name: this.attributes.name,
        }),
      ...(this.attributes &&
        this.attributes.href && {
          href: this.attributes.href,
        }),
      ...(this.attributes &&
        this.attributes.fit && {
          fit: this.attributes.fit as objectFit,
        }),
      ...(this.attributes &&
        this.attributes.background_color && {
          background_color: this.attributes.background_color,
        }),
    };
    return newItem;
  }

  public getGalleryItems(): Promise<Array<GenericImageProps>> {
    return new Promise((res, rej) => {
      this.getRawItemsFromAPI()
        .then((items: Array<any>) => {
          const newOptions = items.map((i: any) => {
            const newItem: GenericImageProps = {
              id: Number(i.id),
              ...(i.attributes &&
                i.attributes.name && {
                  name: i.attributes.name,
                }),
              ...(i.attributes &&
                i.attributes.href && {
                  href: i.attributes.href,
                }),
              ...(i.attributes &&
                i.attributes.img_picture && {
                  img_picture: i.attributes.img_picture,
                }),
              ...(i.attributes &&
                i.attributes.fit && {
                  fit: i.attributes.fit as objectFit,
                }),
              ...(i.attributes &&
                i.attributes.background_color && {
                  background_color: i.attributes.background_color,
                }),
            };
            return newItem;
          });
          res(newOptions);
        })
        .catch((e) => rej(e));
    });
  }
}

export class BasePictureAttributes extends CommonFields {
  private _img_picture: Signal<string> = signal('');
  private _name: Signal<string> = signal('');
  private _description: Signal<string> = signal('');
  private _href: Signal<string> = signal('');
  private _full_size: Signal<boolean> = signal(false);
  private _fit: Signal<objectFit> = signal('cover');
  private _background_color: Signal<string> = signal('');

  public setAttributesFromPlainObject(object: any) {
    if (object.attributes) {
      super.setAttributesFromPlainObject(object);
      this.img_picture = object.attributes.img_picture ?? this.img_picture;
      this.name = object.attributes.name ?? this.name;
      this.description = object.attributes.description ?? this.description;
      this.href = object.attributes.href ?? this.href;
      this.full_size =
        object.attributes.full_size !== undefined
          ? object.attributes.full_size
          : true;
      this.fit = object.attributes.fit;
      this.background_color = object.attributes.background_color;
    }
  }

  public getPlainAttributes(): any {
    return {
      ...super.getPlainAttributes(),
      ...(this.img_picture && {
        img_picture: this.img_picture,
      }),
      ...(this.name && {
        name: this.name,
      }),
      ...(this.description && {
        description: this.description,
      }),
      ...(this.href && {
        href: this.href,
      }),
      full_size: this.full_size,
      ...(this.fit && {
        fit: this.fit,
      }),
      ...(this.background_color && {
        background_color: this.background_color,
      }),
    };
  }

  public reset() {
    this.img_picture = '';
    this.name = '';
    this.description = '';
    this.href = '';
    this.full_size = true;
    this.fit = 'cover';
    this.background_color = '';
  }

  public get img_picture() {
    return this._img_picture.value;
  }
  public set img_picture(value) {
    this._img_picture.value = value;
  }

  public get name() {
    return this._name.value;
  }
  public set name(value) {
    this._name.value = value;
  }

  public get description() {
    return this._description.value;
  }
  public set description(value) {
    this._description.value = value;
  }

  public get href() {
    return this._href.value;
  }
  public set href(value) {
    this._href.value = value;
  }

  public get full_size() {
    return this._full_size.value;
  }
  public set full_size(value) {
    this._full_size.value = value;
  }

  public get fit() {
    return this._fit.value;
  }
  public set fit(value) {
    this._fit.value = value;
  }

  public get background_color() {
    return this._background_color.value;
  }
  public set background_color(value) {
    this._background_color.value = value;
  }
}
