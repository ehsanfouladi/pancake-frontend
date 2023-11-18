import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const SubMenu: React.FC<React.PropsWithChildren> = () => {
  const { pathname } = useRouter()
  const { t } = useTranslation()
  console.log('pathname', pathname);
  
  const subMenuItems = useMemo(() => {
    return [
      { label: t('Live'), href: '/trading-reward/top-traders/live#submenu' },
      { label: t('Finished'), href: '/trading-reward/top-traders/finished#submenu' },
      { label: t('Upcoming'), href: '/trading-reward/top-traders/upcoming#submenu' },
    ]
  }, [t])

  const activeSubItem = useMemo(() => {
    return subMenuItems.find((subMenuItem) => subMenuItem.href === `${pathname}#submenu`)?.href
  }, [subMenuItems, pathname])

  return <SubMenuItems items={subMenuItems} activeItem={activeSubItem} id='submenu'/>
}

export default SubMenu
