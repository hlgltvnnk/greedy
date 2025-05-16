/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/greedy_solana.json`.
 */
export type GreedySolana = {
  address: 'Be1tUaMkbDZEX65BgXHNwh7wrNRWUwNH92ggsB8UuLJd';
  metadata: {
    name: 'greedySolana';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'claimSaleReward';
      discriminator: [68, 149, 238, 16, 228, 184, 171, 50];
      accounts: [
        {
          name: 'sender';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'participant';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 97, 114, 116, 105, 99, 105, 112, 97, 110, 116];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
              {
                kind: 'account';
                path: 'sender';
              },
            ];
          };
        },
        {
          name: 'mint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 109, 105, 110, 116];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'recipientTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'sender';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'saleTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'sale';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
      ];
    },
    {
      name: 'completeSale';
      discriminator: [212, 87, 122, 108, 63, 103, 44, 185];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'saleMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'sale.id';
                account: 'sale';
              },
            ];
          };
        },
        {
          name: 'wsolMint';
          address: 'So11111111111111111111111111111111111111112';
        },
        {
          name: 'saleTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'sale';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'saleMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'authorityTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'authority';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'saleMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'authorityWsolTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'authority';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'wsolMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
      ];
    },
    {
      name: 'createAmm';
      discriminator: [242, 91, 21, 170, 5, 68, 125, 64];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'pool';
          writable: true;
        },
        {
          name: 'config';
        },
        {
          name: 'baseMint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'sale.id';
                account: 'sale';
              },
            ];
          };
        },
        {
          name: 'quoteMint';
        },
        {
          name: 'lpMint';
          writable: true;
        },
        {
          name: 'authorityBaseTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'authority';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'baseMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'authorityQuoteTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'authority';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'quoteMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'authorityPoolTokenAccount';
          writable: true;
        },
        {
          name: 'poolBaseTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'baseMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'poolQuoteTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'pool';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'quoteMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'eventAuthority';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'token2022Program';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'ammProgram';
          address: 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
      ];
    },
    {
      name: 'createSale';
      discriminator: [137, 197, 124, 245, 254, 35, 17, 12];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'saleStats';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 115, 116, 97, 116, 115];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 109, 105, 110, 116];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'metadataAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: 'account';
                path: 'tokenMetadataProgram';
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'account';
              path: 'tokenMetadataProgram';
            };
          };
        },
        {
          name: 'tokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'sale';
              },
              {
                kind: 'account';
                path: 'tokenProgram';
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenMetadataProgram';
          address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'args';
          type: {
            defined: {
              name: 'createSaleArgs';
            };
          };
        },
      ];
    },
    {
      name: 'initializeContractState';
      discriminator: [251, 11, 95, 8, 74, 223, 107, 91];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'state';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: 'programAccount';
          address: '5nmcjKYEkzBZoA5B5JpDn99BdF1Mf3qghibiDYW7LmYo';
        },
        {
          name: 'programData';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'authority';
          type: 'pubkey';
        },
        {
          name: 'multiplier';
          type: 'u64';
        },
      ];
    },
    {
      name: 'participateInSale';
      discriminator: [106, 6, 158, 76, 103, 13, 191, 189];
      accounts: [
        {
          name: 'sender';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'saleStats';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 115, 116, 97, 116, 115];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'state';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: 'participant';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 97, 114, 116, 105, 99, 105, 112, 97, 110, 116];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
              {
                kind: 'account';
                path: 'sender';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'claimHour';
          type: 'u16';
        },
      ];
    },
    {
      name: 'recharge';
      discriminator: [24, 185, 26, 126, 177, 122, 171, 66];
      accounts: [
        {
          name: 'sender';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'participant';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [112, 97, 114, 116, 105, 99, 105, 112, 97, 110, 116];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
              {
                kind: 'account';
                path: 'sender';
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
      ];
    },
    {
      name: 'setContractAuthority';
      discriminator: [86, 93, 212, 48, 195, 110, 7, 247];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'state';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'authority';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'setContractMultiplier';
      discriminator: [30, 222, 28, 246, 235, 105, 202, 242];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'state';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 116, 97, 116, 101];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'multiplier';
          type: 'u64';
        },
      ];
    },
    {
      name: 'updateMintMetadataDate';
      discriminator: [55, 150, 194, 234, 126, 17, 41, 239];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
        {
          name: 'metadataAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: 'account';
                path: 'tokenMetadataProgram';
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'account';
              path: 'tokenMetadataProgram';
            };
          };
        },
        {
          name: 'mint';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101, 95, 109, 105, 110, 116];
              },
              {
                kind: 'account';
                path: 'sale.id';
                account: 'sale';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'tokenMetadataProgram';
          address: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s';
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'args';
          type: {
            defined: {
              name: 'metadataArgs';
            };
          };
        },
      ];
    },
    {
      name: 'updateSale';
      discriminator: [151, 247, 21, 75, 228, 124, 195, 19];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'targetDeposit';
          type: 'u64';
        },
        {
          name: 'description';
          type: {
            array: ['u8', 256];
          };
        },
        {
          name: 'name';
          type: {
            array: ['u8', 32];
          };
        },
        {
          name: 'endDate';
          type: 'i64';
        },
        {
          name: 'unlockRange';
          type: {
            array: ['u16', 2];
          };
        },
      ];
    },
    {
      name: 'updateSaleDescription';
      discriminator: [14, 78, 255, 8, 87, 31, 2, 114];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'description';
          type: {
            array: ['u8', 256];
          };
        },
      ];
    },
    {
      name: 'updateSaleEndDate';
      discriminator: [198, 12, 70, 152, 42, 155, 241, 38];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'endDate';
          type: 'i64';
        },
      ];
    },
    {
      name: 'updateSaleName';
      discriminator: [55, 150, 7, 82, 158, 216, 104, 2];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'name';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'updateSaleTargetDeposit';
      discriminator: [251, 247, 129, 29, 255, 85, 113, 182];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'targetDeposit';
          type: 'u64';
        },
      ];
    },
    {
      name: 'updateSaleUnlockRange';
      discriminator: [218, 54, 201, 113, 192, 123, 1, 129];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'sale';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [115, 97, 108, 101];
              },
              {
                kind: 'arg';
                path: 'saleId';
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'saleId';
          type: 'u128';
        },
        {
          name: 'unlockRange';
          type: {
            array: ['u16', 2];
          };
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'participant';
      discriminator: [32, 142, 108, 79, 247, 179, 54, 6];
    },
    {
      name: 'sale';
      discriminator: [202, 64, 232, 171, 178, 172, 34, 183];
    },
    {
      name: 'saleStats';
      discriminator: [209, 91, 214, 38, 101, 207, 4, 227];
    },
    {
      name: 'state';
      discriminator: [216, 146, 107, 94, 104, 75, 182, 177];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'authorityMismatch';
      msg: 'Authority mismatched';
    },
    {
      code: 6001;
      name: 'illegalOwner';
      msg: 'Account has illegal owner';
    },
    {
      code: 6002;
      name: 'invalidProgramData';
      msg: 'Invalid program data account';
    },
    {
      code: 6003;
      name: 'invalidProgramAccount';
      msg: 'Invalid program account';
    },
    {
      code: 6004;
      name: 'invalidUuid';
      msg: 'Invalid UUID version';
    },
    {
      code: 6005;
      name: 'invalidEndDate';
      msg: 'Invalid sale end date';
    },
    {
      code: 6006;
      name: 'invalidTargetDeposit';
      msg: 'Invalid target deposit';
    },
    {
      code: 6007;
      name: 'invalidUnlockRange';
      msg: 'Invalid sale unlock range';
    },
    {
      code: 6008;
      name: 'invalidPrice';
      msg: 'Invalid sale price';
    },
    {
      code: 6009;
      name: 'saleAlreadyStarted';
      msg: 'Sale already started';
    },
    {
      code: 6010;
      name: 'inactiveSale';
      msg: 'Sale is inactive';
    },
    {
      code: 6011;
      name: 'activeSale';
      msg: 'Sale is still active - recharge is available only on closed sales';
    },
    {
      code: 6012;
      name: 'lockedSale';
      msg: 'Sale is still locked';
    },
    {
      code: 6013;
      name: 'invalidParticipationAmount';
      msg: 'Invalid amount sale for sale participation';
    },
    {
      code: 6014;
      name: 'invalidClaimHour';
      msg: 'Invalid claim hour - must be less than sale unlock range';
    },
    {
      code: 6015;
      name: 'earlyClaim';
      msg: 'Early claim - participant is trying to claim before the claim hour';
    },
    {
      code: 6016;
      name: 'invalidMint';
      msg: 'Invalid mint';
    },
    {
      code: 6017;
      name: 'valueOverflow';
      msg: 'Value overflow - not possible';
    },
    {
      code: 6018;
      name: 'saleIsNotFilledEnough';
      msg: 'Sale is not filled enough';
    },
    {
      code: 6019;
      name: 'filledSale';
      msg: 'saleAlreadyFiled';
    },
    {
      code: 6020;
      name: 'distributionAmountExceeded';
      msg: 'Distribution amount exceeded';
    },
    {
      code: 6021;
      name: 'saleIsNotCompleted';
      msg: 'Sale is not completed';
    },
    {
      code: 6022;
      name: 'saleIsCompleted';
      msg: 'Sale is already completed';
    },
    {
      code: 6023;
      name: 'invalidMultiplier';
      msg: 'Invalid sale multiplier';
    },
    {
      code: 6024;
      name: 'invalidSeeds';
      msg: 'Invalid pda seeds';
    },
    {
      code: 6025;
      name: 'participantAlreadyClaimed';
      msg: 'Participant has already claimed tokens or recharged SOL';
    },
  ];
  types: [
    {
      name: 'createSaleArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'metadata';
            type: {
              defined: {
                name: 'metadataArgs';
              };
            };
          },
          {
            name: 'unlockWithAdmin';
            type: 'bool';
          },
          {
            name: 'targetDeposit';
            type: 'u64';
          },
          {
            name: 'name';
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'description';
            type: {
              array: ['u8', 256];
            };
          },
          {
            name: 'startDate';
            type: 'i64';
          },
          {
            name: 'endDate';
            type: 'i64';
          },
          {
            name: 'unlockRange';
            type: {
              array: ['u16', 2];
            };
          },
        ];
      };
    },
    {
      name: 'metadataArgs';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'symbol';
            type: 'string';
          },
          {
            name: 'uri';
            type: 'string';
          },
        ];
      };
    },
    {
      name: 'participant';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            docs: ['Sale round version, default to 1'];
            type: 'u8';
          },
          {
            name: 'saleId';
            docs: ['Sale UUID'];
            type: 'u128';
          },
          {
            name: 'payer';
            docs: ['User wallet account'];
            type: 'pubkey';
          },
          {
            name: 'claimHour';
            docs: ['User claim hour'];
            type: 'u16';
          },
          {
            name: 'depositedAmount';
            docs: ['How much the user has deposited'];
            type: 'u64';
          },
          {
            name: 'greedLevel';
            docs: ['User greed level'];
            type: 'u64';
          },
          {
            name: 'isClaimed';
            docs: ['Whether the user has claimed tokens or recharged SOL'];
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'sale';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            docs: ['Account version'];
            type: 'u8';
          },
          {
            name: 'id';
            docs: ['Sale UUID'];
            type: 'u128';
          },
          {
            name: 'name';
            docs: ['Sale name'];
            type: {
              array: ['u8', 32];
            };
          },
          {
            name: 'description';
            docs: ['Sale description'];
            type: {
              array: ['u8', 256];
            };
          },
          {
            name: 'authority';
            docs: ['Sale authority'];
            type: 'pubkey';
          },
          {
            name: 'mint';
            docs: ['Sale mint'];
            type: 'pubkey';
          },
          {
            name: 'startDate';
            docs: ['Sale start date'];
            type: 'i64';
          },
          {
            name: 'endDate';
            docs: ['Sale end date'];
            type: 'i64';
          },
          {
            name: 'targetDeposit';
            docs: ['Target amount in sol'];
            type: 'u64';
          },
          {
            name: 'unlockRange';
            docs: ['Unlock range'];
            type: {
              array: ['u16', 2];
            };
          },
          {
            name: 'isLocked';
            docs: ['Whether the sale is unlocked'];
            type: 'bool';
          },
          {
            name: 'depositedAmount';
            docs: ['Amount of deposited SOL'];
            type: 'u64';
          },
          {
            name: 'totalGreed';
            docs: ['Total greed level for sale'];
            type: 'u64';
          },
          {
            name: 'completed';
            docs: ['Whether the sale is unlocked'];
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'saleStats';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            docs: ['Account version'];
            type: 'u8';
          },
          {
            name: 'id';
            docs: ['Sale UUID'];
            type: 'u128';
          },
          {
            name: 'participationCount';
            docs: ['Sale participant count'];
            type: 'u64';
          },
          {
            name: 'stats';
            docs: ['Deposit statistics'];
            type: {
              array: ['u64', 100];
            };
          },
        ];
      };
    },
    {
      name: 'state';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            docs: ['Account version'];
            type: 'u8';
          },
          {
            name: 'authority';
            docs: ['Contract authority'];
            type: 'pubkey';
          },
          {
            name: 'multiplier';
            docs: ['Multiplier coefficient'];
            type: 'u64';
          },
        ];
      };
    },
  ];
};
