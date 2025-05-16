import classNames from 'classnames';
import { useField } from 'formik';
import { MAX_DESCRIPTION_LENGTH } from '../../constants/sale';

type TextInputProps = {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export const TextInput: React.FC<TextInputProps> = ({ label, icon, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className={classNames('relative', props.disabled && 'opacity-50')}>
      {label && <label className="block text-sm/[100%] px-2 text-[#96B9C5] mb-2">{label}</label>}

      <div className="relative">
        <input
          {...field}
          {...props}
          disabled={props.disabled}
          className={classNames(
            'form-input hide-native-datetime-icon placeholder-secondary',
            props.className,
            meta.touched && meta.error ? 'border-fail' : 'border-default',
          )}
        />
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {meta.touched && meta.error && (
        <p className="absolute -bottom-4 left-2 text-fail text-xs/[100%] font-medium font-secondary">
          {meta.error}
        </p>
      )}
    </div>
  );
};

type TextAreaInputProps = {
  name: string;
  placeholder?: string;
  className?: string;
};

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="flex relative">
      <textarea
        {...field}
        {...props}
        className={classNames(
          'form-input placeholder-secondary resize-none h-38 pt-3 pb-8 scrollbar-0 no-scrollbar',
          props.className,
          meta.touched && meta.error ? 'border-fail' : 'border-default',
        )}
      />
      {meta.touched && meta.error && (
        <p className="absolute -bottom-4 left-2 text-fail text-xs/[100%] font-medium font-secondary">
          {meta.error}
        </p>
      )}
      <p
        style={{ width: 'calc(100% - 8px)' }}
        className={classNames(
          'absolute w-full bottom-[1px] right-1 text-sm/[100%] rounded-2xl py-2 px-1 bg-[#0F181B] font-medium font-secondary text-right',
          field.value.length > MAX_DESCRIPTION_LENGTH
            ? 'text-fail'
            : 'text-secondary-text opacity-40',
        )}>
        {field.value.length} / {MAX_DESCRIPTION_LENGTH}
      </p>
    </div>
  );
};
