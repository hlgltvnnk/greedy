import { SalesContractService } from './SalesContractService';
import { env } from '../../config/env';

const GreedySalesService = new SalesContractService(env.SOLANA_URL);

export { GreedySalesService };
