import { ContextApi } from "@pancakeswap/localization";
import { FooterLinkType } from "../../../components/Footer/types";

export const footerLinks: (t: ContextApi["t"]) => FooterLinkType[] = (t) => [
  {
    label: t("About"),
    items: [
      {
        label: t("Contact"),
        href: "https://t.me/cadinulover",
        isHighlighted: true,
      },
      // {
      //   label: t("Customer Support"),
      
      //   href: "https://t.me/cadinulover",
      // },
      // {
      //   label: t("Blog"),
      //   href: "https://blog.pancakeswap.finance/",
      // },
      {
        label: t("Community"),
        href:  "https://t.me/cadinuchat",
      },
      // {
      //   label: t("Road map"),
      //   href: "https://cadinu.io/#Roadmap",
      // },
    ],
  },
  {
    label: t("Help"),
    items: [
      {
        label: t("Customer Support"),
        href: "https://t.me/cadinulover",
      },
      // {
      //   label: t("Troubleshooting"),
      //   href: "https://docs.pancakeswap.finance/help/troubleshooting",
      // },
      {
        label: t("Guides"),
        href: "https://blog.cadinu.io/articles/CADINU-Token-WhitePaper",
      },
    ],
  },
  // {
  //   label: t("Developers"),
  //   items: [
  //     {
  //       label: "Github",
  //       href: "https://github.com/pancakeswap",
  //     },
  //     {
  //       label: t("Documentation"),
  //       href: "https://docs.pancakeswap.finance",
  //     },
  //     {
  //       label: t("Bug Bounty"),
  //       href: "https://docs.pancakeswap.finance/code/bug-bounty",
  //     },
  //     {
  //       label: t("Audits"),
  //       href: "https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited",
  //     },
  //     {
  //       label: t("Careers"),
  //       href: "https://docs.pancakeswap.finance/hiring/become-a-chef",
  //     },
  //   ],
  // },
];
