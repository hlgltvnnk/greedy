import Big, { BigSource } from 'big.js';
import { BN } from '@coral-xyz/anchor';
import { SCORE_TOKEN_DECIMALS } from '../constants/core';
import { BASE } from '../constants/core';

export const getIntlFormattedNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Formats the given amount by dividing it by BASE to the power of decimals and
 * then fixing it to a certain number of decimal places.
 *
 * @param {BigSource} amount - The amount to format.
 * @param {number} decimals - The number of decimals to adjust for.
 * @param {number} toFixed - The number of decimal places in the result.
 * @returns {string} - The formatted amount as a string.
 */
export const getAmountFormatted = (
  amount: BigSource = 0,
  decimals: number = SCORE_TOKEN_DECIMALS,
  toFixed: number = 1,
  separator: 'comma' | 'space' = 'comma',
): string => {
  const base = new Big(BASE).pow(decimals);
  const value = new Big(amount).div(base);
  const numericValue = Number(value.toFixed(toFixed));

  if (Number(numericValue) === 0) return '0';

  if (Math.abs(numericValue) >= 1_000_000_000) {
    const billions = Math.floor(numericValue / 1_000_000_000);
    const rest = Math.floor((numericValue % 1_000_000_000) / 1_000_000);
    return `${billions}B${rest > 0 ? ` ${rest}M` : ''}`;
  }

  if (Math.abs(numericValue) >= 1_000_000) {
    const millions = Math.floor(numericValue / 1_000_000);
    const rest = Math.floor((numericValue % 1_000_000) / 1_000);
    return `${millions}M${rest > 0 ? ` ${rest}K` : ''}`;
  }

  if (Math.abs(numericValue) >= 10_000) {
    const valueInThousands = numericValue / 1_000;
    const formattedNumber = getIntlFormattedNumber(valueInThousands);
    return `${formattedNumber}K`;
  }

  if (Math.abs(numericValue) >= 1_000) {
    const thousands = numericValue / 1_000;
    const formattedNumber = getIntlFormattedNumber(thousands);
    return `${formattedNumber}K`;
  }

  const formattedNumber = new Intl.NumberFormat('en-US', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);

  if (separator === 'space') {
    return formattedNumber.replace(/,/g, ' ');
  }
  if (separator === 'comma') {
    return formattedNumber.replace(/ /g, ',');
  }

  return formattedNumber;
};

export const getAmountFormattedNumber = (
  amount: BigSource = 0,
  decimals: number = SCORE_TOKEN_DECIMALS,
  toFixed: number = 2,
) => {
  const base = new Big(BASE).pow(decimals);
  const value = new Big(amount).div(base);
  const numericValue = Number(value.toFixed(toFixed));

  return numericValue;
};

export const bufferFromString = (str: string, length: number): Buffer => {
  const buf = Buffer.alloc(length);
  buf.write(str);
  return buf;
};

export const uuidToBn = (uuid: string): BN => {
  const hex = uuid.replace(/-/g, '');
  return new BN(hex, 16);
};

export const solToLamportsBN = (sol: number): BN => new BN(Math.floor(sol * 1_000_000_000));

export const lamportsBNToSol = (lamports: BN): number =>
  Number(lamports.toString()) / 1_000_000_000;
