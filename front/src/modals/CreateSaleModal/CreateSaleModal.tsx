import { useEffect, useRef, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { BN } from '@coral-xyz/anchor';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import { TextInput, TextAreaInput } from './Inputs';
import { GreedySalesService } from '../../services/contracts';
import { useWallet } from '@solana/wallet-adapter-react';
import { lamportsBNToSol, solToLamportsBN, uuidToBn } from '../../utils/core';
import { bufferFromString } from '../../utils/core';
import { showToast } from '../../utils/toast';
import { useAppStore } from '../../store/appStore';
import { useSaleStore } from '../../store/useSaleStore';
import { ICreateSaleModal } from '../../interfaces/modals';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_HOURS,
  MAX_SALE_NAME_LENGTH,
  MAX_TOKEN_NAME_LENGTH,
  MAX_TOKEN_SYMBOL_LENGTH,
  MIN_HOURS,
  MIN_TARGET_IN_SOL,
} from '../../constants/sale';
import AgreementCheckbox from './CheckBox';
import UploadIcon from '../../assets/upload.svg?react';
import { uploadFileToPinata } from '../../services/PinataService';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';
import { Tooltip } from '../../components';
import FAQIcon from '../../assets/faq.svg?react';
import { useTokensStore } from '../../store/useTokensStore';
import { formatToLocalDatetime } from '../../utils/date';

const validationSchema = (isEdit: boolean) =>
  Yup.object().shape({
    image: Yup.mixed().required('Image is required'),
    tokenName: Yup.string()
      .required('Token Name is required')
      .max(
        MAX_TOKEN_NAME_LENGTH,
        `Token Name must be less than ${MAX_TOKEN_NAME_LENGTH} characters`,
      ),
    ticker: Yup.string()
      .required('Ticker is required')
      .max(
        MAX_TOKEN_SYMBOL_LENGTH,
        `Ticker must be less than ${MAX_TOKEN_SYMBOL_LENGTH} characters`,
      ),
    saleName: Yup.string()
      .required('Sale Name is required')
      .max(MAX_SALE_NAME_LENGTH, `Sale Name must be less than ${MAX_SALE_NAME_LENGTH} characters`),
    description: Yup.string()
      .max(
        MAX_DESCRIPTION_LENGTH,
        `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`,
      )
      .optional(),
    targetInSol: Yup.number()
      .required('Target in SOL is required')
      .min(MIN_TARGET_IN_SOL, 'Target in SOL must be greater than 5'),
    startDate: Yup.date()
      .transform((_, originalValue) =>
        originalValue === '' || originalValue === null ? null : new Date(originalValue),
      )
      .when([], () => {
        return isEdit
          ? Yup.date().notRequired()
          : Yup.date()
              .required('Start date is required')
              .min(new Date(), 'Start date must be in the future');
      }),
    endDate: Yup.date()
      .transform((_, originalValue) => {
        return originalValue === '' || originalValue === null ? null : new Date(originalValue);
      })
      .required('End date is required')
      .min(new Date(), 'End date must be in the future')
      .when('startDate', (startDate, schema) => {
        return startDate instanceof Date && !isNaN(startDate.getTime())
          ? schema.min(startDate, 'End date must be after start date')
          : schema;
      }),
    minHours: Yup.number()
      .required('Min is required')
      .min(MIN_HOURS, `Min must be greater than ${MIN_HOURS - 1}`)
      .max(MAX_HOURS, `Min must be less than ${MAX_HOURS}`),
    maxHours: Yup.number()
      .required('Max is required')
      .moreThan(Yup.ref('minHours'), 'Max must be greater than min')
      .lessThan(MAX_HOURS + 1, `Max must be less than ${MAX_HOURS}`),
    requireAdmin: Yup.boolean().optional(),
    agreed: Yup.boolean().oneOf([true], 'You must accept terms'),
  });

const CreateSaleModal: React.FC<ICreateSaleModal> = ({
  sale,
  closeModal,
  showSuccess,
  showConnectWallet,
}) => {
  const tokenMetadata = useTokensStore((state) => (sale ? state.getMetadata(sale?.mint) : null));
  const { publicKey } = useWallet();
  const setIsLoading = useAppStore((s) => s.setIsLoading);
  const fetchSale = useSaleStore((s) => s.fetchSale);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tokenMetadata?.image) {
      setImagePreview(tokenMetadata.image);
    }
  }, [tokenMetadata]);

  return (
    <div className="modal w-full max-w-[385px] sm:max-w-[440px] md:max-w-[540px] max-h-[90%] lg:p-8 p-6 flex flex-col overflow-y-auto">
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
        <img src="/images/close.png" alt="close" className="w-6 h-6" />
      </button>

      <Formik
        initialValues={{
          tokenName: tokenMetadata?.name ?? '',
          ticker: tokenMetadata?.symbol ?? '',
          saleName: sale ? sale.name : '',
          description: sale ? sale.description : '',
          startDate: sale ? formatToLocalDatetime(new Date(sale.startDate)) : '',
          endDate: sale ? formatToLocalDatetime(new Date(sale.endDate)) : '',
          minHours: sale?.unlockRange?.[0]?.toString() ?? '',
          maxHours: sale?.unlockRange?.[1]?.toString() ?? '',
          image: tokenMetadata?.image ?? '',
          requireAdmin: sale?.isLocked ?? false,
          targetInSol: sale ? lamportsBNToSol(sale.targetDeposit).toString() : '',
          agreed: !!sale,
        }}
        validationSchema={validationSchema(!!sale)}
        onSubmit={async (values) => {
          if (!publicKey) {
            showConnectWallet();
            return;
          }
          setIsLoading(true);

          try {
            const file = values.image as File | string;
            let imageUri: string;
            if (typeof file === 'string') {
              imageUri = file;
            } else {
              imageUri = await uploadFileToPinata(file);
            }
            const metadataUri = await uploadFileToPinata(
              new File(
                [
                  JSON.stringify({
                    name: values.tokenName,
                    symbol: values.ticker,
                    image: imageUri,
                  }),
                ],
                'metadata.json',
                { type: 'application/json' },
              ),
            );

            const metadata = {
              name: values.tokenName,
              symbol: values.ticker,
              uri: metadataUri,
            };

            const args = {
              metadata,
              unlockWithAdmin: values.requireAdmin,
              name: Array.from(bufferFromString(values.saleName, 32)),
              description: Array.from(bufferFromString(values.description, 256)),
              startDate: new BN(new Date(values.startDate || '').getTime() / 1000),
              endDate: new BN(new Date(values.endDate || '').getTime() / 1000),
              unlockRange: [Number(values.minHours), Number(values.maxHours)],
              targetDeposit: solToLamportsBN(Number(values.targetInSol)),
            };

            let signature: string;
            const saleId: string | BN = sale ? sale.id : uuidv4();
            if (sale) {
              signature = await GreedySalesService.updateSale(
                uuidToBn(saleId),
                {
                  targetDeposit: args.targetDeposit,
                  description: args.description,
                  name: args.name,
                  endDate: args.endDate,
                  unlockRange: args.unlockRange as [number, number],
                },
                publicKey,
              );
            } else {
              signature = await GreedySalesService.createSale(uuidToBn(saleId), args, publicKey);
            }
            const confirmation = await GreedySalesService.confirmTx(signature);
            if (confirmation.value.err) {
              console.error('Transaction failed', confirmation.value.err);
              throw new Error(JSON.stringify(confirmation.value.err));
            } else {
              closeModal();
              showToast('success', `Sale ${sale ? 'updated' : 'created'} successfully!`);
              await fetchSale(saleId);
              if (!sale) {
                showSuccess(saleId);
              }
            }
          } catch (error) {
            console.error('Transaction failed', error);
            showToast('error', `Sale ${sale ? 'update' : 'creation'} failed`);
          } finally {
            setIsLoading(false);
          }
        }}>
        {({ isSubmitting, setFieldValue, errors, values }) => (
          <Form className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div
                className={classNames(
                  'flex items-center justify-center w-20 h-20 bg-[#263D45] rounded-2xl overflow-hidden border border-solid border-default-border',
                  !sale && 'cursor-pointer',
                )}
                onClick={() => {
                  if (!sale) inputRef.current?.click();
                }}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Avatar preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <UploadIcon className="w-6 h-6 text-[#5E93A6]" />
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="avatar"
                  className={classNames('text-[18px] font-semibold', errors.image && 'text-fail')}>
                  Upload Token Avatar
                </label>
                <input
                  ref={inputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  className="mt-2 hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      const maxSizeInBytes = 1 * 1024 * 1024;
                      if (file.size > maxSizeInBytes) {
                        showToast('error', 'File size exceeds 1MB limit.');
                        return;
                      }

                      setFieldValue('image', file);
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-sm/[100%] text-center text-secondary-text font-normal">
                  .png, .jpg, .gif – max 1MB, 256×256 recommended
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold">Token Info</h2>
              <TextInput name="tokenName" placeholder="Token Name" disabled={!!sale} />
              <TextInput name="ticker" placeholder="Token Ticker" disabled={!!sale} />
              <TextAreaInput name="description" placeholder="Description (Optional)" />
            </div>

            <div className="space-y-6">
              <h2 className="text-[18px] font-semibold">Sale Parameters</h2>
              <TextInput name="saleName" placeholder="Sale Name" />
              <TextInput
                name="startDate"
                type="datetime-local"
                label="Sale Starts (Your local time)"
                icon={
                  <img src="/images/airdrop/date-white.png" alt="calendar" className="w-8 h-8" />
                }
                disabled={!!sale}
              />
              <TextInput
                name="endDate"
                type="datetime-local"
                label="Sale Ends (Your local time)"
                icon={
                  <img src="/images/airdrop/date-white.png" alt="calendar" className="w-8 h-8" />
                }
              />
              <TextInput
                label="Target in SOL"
                type="number"
                name="targetInSol"
                placeholder="Minimum 5 SOL"
              />
              <div>
                <label className="block text-sm/[100%] px-2 text-[#96B9C5] mb-2">
                  Unlock Range
                </label>
                <div className="flex items-center gap-2">
                  <TextInput type="number" name="minHours" placeholder="Min Hours (e.g. 1)" />
                  <span className="text-md/[100%] font-semibold">-</span>
                  <TextInput type="number" name="maxHours" placeholder="Max Hours (e.g. 100)" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={classNames(
                    'flex items-center text-[14px] gap-1 text-[#96B9C5] font-normal px-2',
                    sale && 'text-[rgba(150,185,197,0.4)]',
                  )}>
                  Require Admin Participate to Start Sale
                  <FAQIcon data-tooltip-id="require-admin-tooltip" />
                  <Tooltip
                    id="require-admin-tooltip"
                    content="If enabled, only the creator can participate at first. The sale becomes public after their initial deposit."
                  />
                </div>
                <ToggleSwitch
                  disabled={!!sale}
                  checked={values.requireAdmin}
                  onChange={() => setFieldValue('requireAdmin', !values.requireAdmin)}
                />
              </div>
            </div>

            <div className="space-y-4 mt-10">
              <AgreementCheckbox />
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-3 rounded-xl disabled:opacity-50"
                disabled={isSubmitting}>
                {sale ? 'Edit' : 'Launch'} Sale
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateSaleModal;
