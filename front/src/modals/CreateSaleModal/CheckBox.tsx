import { memo } from 'react';
import classNames from 'classnames';
import { useFormikContext } from 'formik';
import CheckMarkIcon from '../../assets/checkmark.svg?react';

const AgreementCheckbox: React.FC = () => {
  const { values, setFieldValue, errors, touched } = useFormikContext<{ agreed: boolean }>();

  const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const termsUrl = `${window.location.origin}/terms`;
    window.open(termsUrl, '_blank', 'noreferrer noopener');
  };

  return (
    <div className="flex flex-col">
      <label
        className="flex items-start gap-2 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setFieldValue('agreed', !values.agreed);
        }}>
        <CheckMarkIcon
          className={classNames('w-6 h-6', {
            'hide-checkmark-part': !values.agreed,
            'text-fail': errors.agreed && touched.agreed,
          })}
        />
        <span className="text-sm/[140%] font-semibold">
          I agree to the Greedy{' '}
          <a href="/terms" className="text-primary underline" onClick={handleTermsClick}>
            terms and conditions.
          </a>
          <br />
          Sale can't be canceled after launch.
        </span>
      </label>
    </div>
  );
};

export default memo(AgreementCheckbox);
