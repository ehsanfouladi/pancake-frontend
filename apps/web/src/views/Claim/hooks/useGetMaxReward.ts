import {useContractRead} from "wagmi";
import claimADAbi from "../../../config/abi/claimAD.json";

const useGetMaxReward = (claimContract)=>{
     const {
        data,
        isError,
        isLoading
    } = useContractRead(
      {
      address: claimContract.address as `0x${string}`,
      abi: claimADAbi,
      functionName: 'maxReward',
      onError(error) {
          console.log('Error', error)
          return error
    },
  })
    return{ maxReward : data}
}
export default useGetMaxReward
