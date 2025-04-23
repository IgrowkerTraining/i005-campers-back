import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

import sanitizeHtml from 'sanitize-html';

export function IsSanitizedHtml(config?: sanitizeHtml.IOptions, ValidationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSanitizedHtml',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [config],
      options: ValidationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const [sanitizeConfig] = args.constraints;
          const sanitized = sanitizeHtml(value, {
            allowedTags: [],
            allowedAttributes: {},
            ...sanitizeConfig,
          });
          return sanitized === value;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a sanitized HTML string`;
        },
      },
    });
  };
}
