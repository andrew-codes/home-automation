import { first } from "lodash"
import { FC } from "react"
import styled from "styled-components"
import Text from "../components/Text"
import { Game } from "../Game"

const Details = styled.section`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  // background: radial-gradient(
  //     ellipse farthest-side at 0% 90%,
  //     rgba(13, 17, 23, 1) 20%,
  //     rgba(13, 17, 23, 0.5),
  //     rgba(255, 255, 255, 0)
  //   ),
  //   radial-gradient(
  //     ellipse farthest-side at 40% 100%,
  //     var(--dark-slate-gray) 10%,
  //     rgba(255, 255, 255, 0),
  //     rgba(255, 255, 255, 0)
  //   ),
  //   radial-gradient(
  //     ellipse farthest-side at 70% 100%,
  //     var(--dark-slate-gray),
  //     rgba(255, 255, 255, 0)
  //   );
`
const GameName = styled.h3`
  font-size: 32px;
`
const GameDescription = styled.div`
  max-height: 160px;
  font-size: 24px;
  line-height: 1.32;
  overflow: hidden;
`

type GameOverviewProps = {
  cdnHost: string
} & Game

const GameOverview: FC<GameOverviewProps> = ({
  cdnHost,
  backgroundImage,
  name,
  releases,
}) => {
  return (
    <>
      <Details>
        <Text as={GameName}>{name}</Text>
        <Text
          as={GameDescription}
          dangerouslySetInnerHTML={{
            __html: first(releases)?.description ?? "",
          }}
        ></Text>
      </Details>
    </>
  )
}

export default GameOverview
