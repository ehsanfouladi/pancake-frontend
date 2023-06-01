import {useContractRead, useContractWrite, usePrepareContractWrite} from "wagmi";
import claimADAbi from "../../../config/abi/claimAD.json";

const useCalculateReward = (contract) => {
    const {config} = usePrepareContractWrite({
        address: contract.address as `0x${string}`,
        abi: claimADAbi,
        functionName: 'rewardCalculation',
        onError(error) {
            console.log('Calculation Prepare error', error)
        },
    })
    const {
        data,
        isLoading,
        isError,
        isSuccess,
        write
    }
        = useContractWrite({
        ...config,
        onError(error) {
            console.log('calculationError', error)
            return {isError, error}
        },
    })
    return {calculatedReward: data, isLoading, isSuccess, calculateReward: write}

}
export default useCalculateReward
