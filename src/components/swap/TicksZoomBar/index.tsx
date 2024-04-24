import { Button } from "@/components/ui/button";

interface TicksZoomBarProps {
    zoom: number;
    onZoom: (value: number) => void;
}

const TicksZoomBar = ({ zoom, onZoom }: TicksZoomBarProps) => {
    const ZOOM_STEP = window.innerWidth < 720 ? 15 : 5;
    const DEFAULT_ZOOM = window.innerWidth < 720 ? 100 : 50;
    const MIN_ZOOM = window.innerWidth < 720 ? 50 : 10;
    const MAX_ZOOM = window.innerWidth < 720 ? 150 : 90;

    const handleZoomIn = () => zoom < MAX_ZOOM && onZoom(zoom + ZOOM_STEP);
    const handleZoomOut = () => zoom > MIN_ZOOM && onZoom(zoom - ZOOM_STEP);

    return (
        <>
            <Button
                variant={zoom === MIN_ZOOM ? "iconActive" : "ghost"}
                className="h-10 max-sm:hidden text-sm"
                onClick={() => onZoom(MIN_ZOOM)}
            >
                10%
            </Button>
            <Button
                variant={zoom === DEFAULT_ZOOM ? "iconActive" : "ghost"}
                className="h-10 max-sm:hidden text-sm"
                onClick={() => onZoom(DEFAULT_ZOOM)}
            >
                50%
            </Button>
            <Button
                variant={zoom === MAX_ZOOM ? "iconActive" : "ghost"}
                className="h-10 max-sm:hidden text-sm"
                onClick={() => onZoom(MAX_ZOOM)}
            >
                100%
            </Button>
            <Button disabled={zoom <= MIN_ZOOM} variant="icon" className="text-lg pb-0.5" size="icon" onClick={handleZoomOut}>
                -
            </Button>
            <Button disabled={zoom >= MAX_ZOOM} variant="icon" size="icon" className="text-lg pb-0.5" onClick={handleZoomIn}>
                +
            </Button>
        </>
    );
};

export default TicksZoomBar;
