import { useTranslation } from "@pancakeswap/localization"
import { ChainId, ERC20Token } from "@pancakeswap/sdk"
import { Card, CardBody, CardHeader, PageSection, Text, useToast } from "@pancakeswap/uikit"
import ApproveConfirmButtons from "components/ApproveConfirmButtons"
import useApproveConfirmTransaction from "hooks/useApproveConfirmTransaction"
import { useCallWithGasPrice } from "hooks/useCallWithGasPrice"
import { getCadinuMigrationAddress } from "utils/addressHelpers"
import { getCadinuMigrationContract } from "utils/contractHelpers"
import { formatUnits } from "viem"
import WalletNotConnected from "views/Claim/components/WalletNotConnected"
import Page from "views/Page"
import { useAccount, useContractRead } from "wagmi"
import { CadinuOLDAbi } from "./components/CadinuOLDAbi"

const Migration = ()=>{
    const {address:account} = useAccount()
    const {toastSuccess} = useToast()
    const {callWithGasPrice} = useCallWithGasPrice()
    const {t} = useTranslation()
    const {data: v1Balance} = useContractRead({
        watch:true,
        address: '0x748ed23b57726617069823dc1e6267c8302d4e76',
        abi: CadinuOLDAbi,
        functionName: 'balanceOf',
        args: [account]
    })
    // const migrationContractAddress = getCadinuMigrationAddress()
    const migrationContract = getCadinuMigrationContract()
    const cadinuOld = new ERC20Token(
        ChainId.BSC,
        '0x748ed23b57726617069823dc1e6267c8302d4e76',
        9,
        'CADINU',
        'Canadian Inuit Dog',
        'https://cadinu.io',
      )
    const { isApproving, isApproved, isConfirmed, isConfirming, handleApprove, handleConfirm } =
    useApproveConfirmTransaction({
      token: cadinuOld,
      spender: getCadinuMigrationAddress(),
      minAmount: v1Balance,
      targetAmount: v1Balance,
      onConfirm: () => {
        return callWithGasPrice(
                migrationContract,
                'migrate',
                []
          )
      },
      
      onApproveSuccess: () => {
        toastSuccess(t('Enabled'), t("Press 'confirm' to migrate to Cadinu V2"))
      },
      onSuccess: () => {
        toastSuccess(t('Success'), t('You have successfully migrated to Cadinu V2'))
      },
    })
    
    
    return(<Page>
        {!account ? (
            <PageSection index={1} backgroundColor='darkblue' hasCurvedDivider={false} width='100%' >
            <WalletNotConnected />
            </PageSection>
        ):(
            <>
            <Card>
                <CardHeader>
                    <Text bold textAlign='center'> Migrate from Cadinu V1 to Cadinu V2</Text>
                </CardHeader>
                <CardBody>
                <Text bold textAlign='center' mb='25px'>{`You currently own ${formatUnits(v1Balance || 0n,9).toString()} Cadinu V1`}</Text>
                <Text bold textAlign='center' mb='25px'>{`You will recieve ${
                  formatUnits(BigInt(Number(v1Balance || 0n) * (10**4)),18)
                  } Cadinu V2`}</Text>

                <Text textAlign='center' mb='25px'>Simply Migrate To Cadinu V2 by 2 Clicks!</Text>
                <ApproveConfirmButtons 
                 isApproveDisabled={ isConfirmed || isConfirming || isApproved }
                 isApproving={isApproving}
                 isConfirmDisabled={!isApproved || isConfirmed }
                 isConfirming={isConfirming}
                 onApprove={handleApprove}
                 onConfirm={handleConfirm}
                />
                </CardBody>
            </Card>
            </>
        )}
        </Page>
    )
}


export default Migration
