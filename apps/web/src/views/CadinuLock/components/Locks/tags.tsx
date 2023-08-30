import { TagProps, Farm as FarmUI } from '@pancakeswap/uikit'
import { CadinuLockState } from 'state/types'

const { ClosedTag, CommunityTag, CoreTag, SoonTag, VoteNowTag } = FarmUI.Tags

interface ProposalStateTagProps extends TagProps {
  cadinuLockState: CadinuLockState
}

export const ProposalStateTag: React.FC<React.PropsWithChildren<ProposalStateTagProps>> = ({
  cadinuLockState,
  ...props
}) => {
  if (cadinuLockState === CadinuLockState.TOKENS) {
    return <VoteNowTag {...props} />
  }

  if (cadinuLockState === CadinuLockState.LIQUIDITY_V2) {
    return <SoonTag {...props} />
  }
  if (cadinuLockState === CadinuLockState.LIQUIDITY_V3) {
    return <SoonTag {...props} />
  }

  return <ClosedTag {...props} />
}

interface ProposalTypeTagProps extends TagProps {
  isCoreProposal: boolean
}

export const ProposalTypeTag: React.FC<React.PropsWithChildren<ProposalTypeTagProps>> = ({
  isCoreProposal,
  ...props
}) => {
  if (isCoreProposal) {
    return <CoreTag {...props} />
  }

  return <CommunityTag {...props} />
}
