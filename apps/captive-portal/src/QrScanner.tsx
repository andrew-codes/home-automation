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

const QrScannerComponent: React.FC<{
  hidden?: boolean
  onError: (error: string) => void
  onScan: (code: string) => void
  onReady: (scanner: Scanner) => void
}> = ({ hidden = false, onError, onReady, onScan }) => {
  const videoRef = React.useRef<HTMLVideoElement>()
  const containerRef = React.useRef<HTMLDivElement>()
  let scanner
  React.useEffect(() => {
    scanner = new QrScanner(videoRef.current, onScan, onError)
    while (containerRef.current.firstChild) {
      containerRef.current.firstChild.remove()
    }
    containerRef.current.appendChild(scanner.$canvas)
    onReady(scanner)

    return function cleanup() {
      scanner.destory()
      scanner = null
    }
  }, [onScan, onError])

  return (
    <VideoContainer hidden={hidden}>
      <div ref={containerRef} />
      <video style={{ display: "none" }} ref={videoRef} />
    </VideoContainer>
  )
}

export default QrScannerComponent
export { Scanner }
