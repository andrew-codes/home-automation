import { first } from "lodash"
import { FC } from "react"
import styled from "styled-components"
import Text from "../components/Text"

const BodyBackground = styled.div`
  position: absolute;
  top: 0;
  height: 1920px;
  width: 2880px;
  left: 0;
  z-index: -1;
  overflow: hidden;
`

const Details = styled.section`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: rgba(39, 40, 38, 1);
  min-height: 650px;
  margin-bottom: 24px;
  overflow: hidden;

  > * {
    padding: 24px;
  }
`
const GameName = styled.h3`
  font-size: 32px;
`
const GameDescription = styled.div`
  font-size: 24px;
  line-height: 1.32;
  overflow-y: auto;

  img {
    width: 100%;
  }
`

type GameOverviewProps = {
  backgroundImage?: string | null | undefined
  name?: string | undefined
  height: number
  releases?: {
    id: string
    description?: string | undefined | null
  }[]
}

const GameOverview: FC<GameOverviewProps> = ({
  backgroundImage,
  height,
  name,
  releases = [],
}) => (
  <>
    <BodyBackground>
      {!!backgroundImage && !/null$/.test(backgroundImage) && (
        <img
          src={`${backgroundImage}?height=${height}`}
          alt={`${name} game background.`}
        />
      )}
    </BodyBackground>
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

export default GameOverview
