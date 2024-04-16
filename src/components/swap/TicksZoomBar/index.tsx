import { Button } from "@/components/ui/button";

interface TicksZoomBarProps {
    zoom: number;
    onZoom: (value: number) => void;
}

const ZOOM_STEP = 5;
const MIN_ZOOM = 10;
const MAX_ZOOM = 90;

const TicksZoomBar = ({ zoom, onZoom }: TicksZoomBarProps) => {
    const handleZoomIn = () => zoom < MAX_ZOOM && onZoom(zoom + ZOOM_STEP)
    const handleZoomOut = () => zoom > MIN_ZOOM && onZoom(zoom - ZOOM_STEP)

    return <>
        <Button variant={zoom === 50 ? "iconActive" : "icon"} className="h-10 max-sm:hidden text-sm" onClick={() => onZoom(50)}>Common</Button>
        <Button variant={zoom === 10 ? "iconActive" : "icon"} className="h-10 max-sm:hidden text-sm" onClick={() => onZoom(10)}>Full</Button>
        <Button disabled={zoom <= MIN_ZOOM} variant="icon" className="text-lg pb-0.5" size='icon' onClick={handleZoomOut}>-</Button>
        <Button disabled={zoom >= MAX_ZOOM} variant="icon" size='icon' className="text-lg pb-0.5" onClick={handleZoomIn}>+</Button>
    </>
}

export default TicksZoomBar