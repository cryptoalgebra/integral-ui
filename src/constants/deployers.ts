import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import {
  CUSTOM_POOL_DEPLOYER_BLANK,
  CUSTOM_POOL_DEPLOYER_FEE_CHANGER,
  CUSTOM_POOL_DEPLOYER_VOLUME_FEE
} from "@/constants/addresses.ts";

export const customPoolDeployerTitles = {
  [ADDRESS_ZERO]: 'Base',
  [CUSTOM_POOL_DEPLOYER_BLANK]: 'Blank',
  [CUSTOM_POOL_DEPLOYER_FEE_CHANGER]: 'Fee Changer',
  [CUSTOM_POOL_DEPLOYER_VOLUME_FEE]: 'Volume Fee'
};
