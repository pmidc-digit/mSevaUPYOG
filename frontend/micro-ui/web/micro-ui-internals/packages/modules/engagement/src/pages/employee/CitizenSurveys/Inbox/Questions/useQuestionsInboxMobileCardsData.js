import { useTranslation } from "react-i18next";
import { format } from "date-fns";
const useQuestionsInboxMobileCardsData = ({parentRoute, table }) => {
    const { t } = useTranslation()

    /**
     * Todo : after creating surveys details page handle serviceRequestIdKey
     */
    const dataForMobileInboxCards = table?.map(({ label, startDate, endDate, answersCount, status, postedBy}) => ({
            [t("Category Name")]: label,
            [t("Question")]: label,
          
    }))

    return ({ data:dataForMobileInboxCards, linkPrefix:`${parentRoute}/search-category/`, serviceRequestIdKey:t("TL_COMMON_TABLE_COL_APP_NO")})

}

export default useQuestionsInboxMobileCardsData