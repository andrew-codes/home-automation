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
    onReady(scanner)

    return function cleanup() {
      scanner.destroy()
      scanner = null
    }
  }, [onError, onReady, onScan])

  // React.useEffect(() => {
  //   if (containerRef.current.children.length === 0) {
  //     containerRef.current.appendChild(scanner.$canvas)
  //   }
  // }, [])

  return (
    <VideoContainer hidden={hidden}>
      <div ref={containerRef} />
      <video ref={videoRef} />
    </VideoContainer>
  )
}

export default QrScannerComponent
export { Scanner }
