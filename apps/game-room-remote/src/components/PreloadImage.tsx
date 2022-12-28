import { FC, ImgHTMLAttributes } from "react"

const PrepareImage: FC<{ rel: string; src: string }> = ({ rel, src }) => {
  return (
    <>
      <link rel={rel} as="image" type="image/png" href={src} />
    </>
  )
}

export default PrepareImage
