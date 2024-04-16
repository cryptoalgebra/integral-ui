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
        <Button variant="ghost" size='icon' onClick={handleZoomOut}>-</Button>
        <Button variant="ghost" className="h-10 max-sm:hidden" onClick={() => onZoom(50)}>Common</Button>
        <Button variant="ghost" className="h-10 max-sm:hidden" onClick={() => onZoom(10)}>Full</Button>
        <Button variant="ghost" size='icon' onClick={handleZoomIn}>+</Button>
    </>
}

export default TicksZoomBar