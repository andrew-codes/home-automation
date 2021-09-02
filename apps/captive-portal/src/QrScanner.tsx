import * as React from "react"
import QrScanner from "qr-scanner"
import styled from "styled-components"
import QrScannerWorkerPath from "!!file-loader!../../../node_modules/qr-scanner/qr-scanner-worker.min.js"
QrScanner.WORKER_PATH = QrScannerWorkerPath

const VideoContainer = styled.div`
  display: ${({ hidden }) => (hidden ? "none" : "block")} !important;
`

type Scanner = {
  start: () => void
  stop: () => void
}

const computeFrame = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const ctx = canvas.getContext("2d")
  ctx.drawImage(video, 0, 0)
  let region = new Path2D()
  region.rect(0, 0, width, height)
  ctx.clip(region)
}

const timerCallback = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  if (video.paused || video.ended) {
    return
  }
  computeFrame(video, canvas, width, height)
  setTimeout(() => {
    timerCallback(video, canvas, width, height)
  }, 0)
}

const QrScannerComponent: React.FC<{
  hidden?: boolean
  onError: (error: string) => void
  onScan: (code: string) => void
  onReady: (scanner: Scanner) => void
}> = ({ hidden = false, onError, onReady, onScan }) => {
  const videoRef = React.useRef<HTMLVideoElement>()
  const scanAreaRef = React.useRef<HTMLCanvasElement>()
  const width = 400
  const height = 400

  React.useEffect(() => {
    const listener = () => {
      timerCallback(videoRef.current, scanAreaRef.current, width, height)
    }
    videoRef?.current?.addEventListener("play", listener, false)

    return function cleanup() {
      videoRef.current.removeEventListener("play", listener, false)
    }
  }, [width, height])

  let scanner
  React.useEffect(() => {
    scanner = new QrScanner(videoRef.current, onScan, onError, () => ({
      width,
      height,
    }))
    onReady(scanner)

    return function cleanup() {
      scanner = null
    }
  }, [])

  return (
    <VideoContainer hidden={hidden}>
      <video style={{ display: "none" }} ref={videoRef} />
      <canvas height={`${height}px`} ref={scanAreaRef} width={`${width}px`} />
    </VideoContainer>
  )
}

export default QrScannerComponent
export { Scanner }
