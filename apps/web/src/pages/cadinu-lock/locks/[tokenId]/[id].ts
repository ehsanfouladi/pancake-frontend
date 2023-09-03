// eslint-disable-next-line camelcase
import { SWRConfig, unstable_serialize } from 'swr'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import { getProposal } from 'state/voting/helpers'
import { ProposalState } from 'state/types'
import Detail from 'views/CadinuLock/Lock/Detail'

import { useRouter } from 'next/router'

export default Detail
