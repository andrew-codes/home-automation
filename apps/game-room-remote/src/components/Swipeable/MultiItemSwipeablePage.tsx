import { ceil } from "lodash"
import { ReactElement, ReactNode, useCallback, useMemo } from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { EffectCreative, Keyboard, Mousewheel } from "swiper"
import { Swiper, SwiperSlide } from "swiper/react"
import { Swiper as SwiperClass } from "swiper"
import { Item } from "./types"
import { on } from "events"

type MultiItemSwipeablePageProps<TItem extends Item> = {
  children: (
    itemsOnPage: TItem[],
    index: number,
    itemDimensions: { height: number; width: number },
  ) => ReactNode[] | ReactNode
  rows: number
  defaultPageIndex?: number
  onChangePage?: (pageIndex: number, indexRange: number[]) => void
  spaceBetween: number
  itemsPerRow: number
  items: TItem[]
  direction: "vertical" | "horizontal"
}
const MultiItemSwipeablePage: <TItem extends Item>(
  props: MultiItemSwipeablePageProps<TItem>,
) => ReactElement = ({
  children,
  defaultPageIndex = 0,
  onChangePage,
  rows = 1,
  spaceBetween,
  itemsPerRow = 1,
  direction = "vertical",
  items,
}) => {
  const countPerPage = itemsPerRow * rows

  const totalPages = useMemo(
    () => ceil(items.length / countPerPage),
    [items.length, countPerPage],
  )
  const pages = useMemo(
    () =>
      new Array(totalPages)
        .fill(0)
        .map((_, index) =>
          items.slice(
            index * countPerPage,
            index * countPerPage + countPerPage,
          ),
        ),
    [totalPages, items, countPerPage],
  )

  const handlePageChange = useCallback(
    (swiper: SwiperClass) => {
      const lastIndexInBlock =
        swiper.activeIndex * countPerPage + countPerPage - 1
      onChangePage?.(swiper.activeIndex, [
        swiper.activeIndex * countPerPage,
        lastIndexInBlock > items.length ? items.length - 1 : lastIndexInBlock,
      ])
    },
    [onChangePage, countPerPage, items.length],
  )

  return (
    <AutoSizer>
      {({ height, width }) => {
        const itemHeight = ceil(height / rows) - spaceBetween - 24
        const itemWidth = ceil((itemHeight * 3) / 4)

        return (
          <Swiper
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            initialSlide={defaultPageIndex}
            grabCursor
            keyboard
            mousewheel
            spaceBetween={spaceBetween}
            direction={direction}
            onSlideChange={handlePageChange}
            modules={[Mousewheel, Keyboard, EffectCreative]}
          >
            {pages.map((page, index) => {
              return (
                <SwiperSlide key={index}>
                  {children(page, index, {
                    height: itemHeight,
                    width: itemWidth,
                  })}
                </SwiperSlide>
              )
            })}
          </Swiper>
        )
      }}
    </AutoSizer>
  )
}

export default MultiItemSwipeablePage
