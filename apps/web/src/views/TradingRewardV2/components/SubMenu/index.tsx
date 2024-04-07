import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

const SubMenu: React.FC<React.PropsWithChildren> = () => {
  const { pathname } = useRouter()
  const { t } = useTranslation()
  console.log('pathname', pathname);
  
  const subMenuItems = useMemo(() => {
    return [
      { label: t('Live'), href: '/trading-competition/top-traders/live#submenu' },
      { label: t('Finished'), href: '/trading-competition/top-traders/finished#submenu' },
      { label: t('Upcoming'), href: '/trading-competition/top-traders/upcoming#submenu' },
    ]
  }, [t])

  const activeSubItem = useMemo(() => {
    return subMenuItems.find((subMenuItem) => subMenuItem.href === `${pathname}#submenu`)?.href
  }, [subMenuItems, pathname])

  return <SubMenuItems items={subMenuItems} activeItem={activeSubItem} id='submenu'/>
}

export default SubMenu
