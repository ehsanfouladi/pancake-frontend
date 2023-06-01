import {useAccount, useContractRead} from "wagmi";
import claimADAbi from "../../../config/abi/claimAD.json";

const useGetLastReward = (claimContract)=>{
    const {address:account} = useAccount()
    const {
        data,
        isSuccess
    } = useContractRead(
      {
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'lastReward',
      args:[account],
      onError(error) {
          console.log('Error', error)
          return error
    },
  })
    return{ lastReward : data , isSuccess}
}
export default useGetLastReward
