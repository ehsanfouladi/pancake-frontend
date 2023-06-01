import {useContractRead} from "wagmi";
import claimADAbi from "../../../config/abi/claimAD.json";

const useGetMinReward = (claimContract)=>{
     const {
        data,
        isError
    } = useContractRead(
      {
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'minReward',
      onError(error) {
      console.log('Error', error)
      return {minRewardError : error, minRewardIsError : isError}
    },
  })
    return {minReward : data}
}
export default useGetMinReward
