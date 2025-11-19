import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '@/core/store';
import { RoomCategory, UIMode } from '@/core/types';
import { ROOM_DEFINITIONS } from '@/game/data/rooms';

const CELL_SIZE = 24;

const CATEGORY_COLORS: { [key in RoomCategory]: string } = {
  [RoomCategory.Living]: 'rgba(74, 222, 128, 0.3)',
  [RoomCategory.Production]: 'rgba(251, 146, 60, 0.3)',
  [RoomCategory.Power]: 'rgba(250, 204, 21, 0.3)',
  [RoomCategory.LifeSupport]: 'rgba(74, 158, 255, 0.3)',
  [RoomCategory.Medical]: 'rgba(248, 113, 113, 0.3)',
  [RoomCategory.Research]: 'rgba(167, 139, 250, 0.3)',
  [RoomCategory.Recreation]: 'rgba(52, 211, 153, 0.3)',
  [RoomCategory.Storage]: 'rgba(156, 163, 175, 0.3)',
  [RoomCategory.Command]: 'rgba(244, 114, 182, 0.3)',
  [RoomCategory.Security]: 'rgba(239, 68, 68, 0.3)',
  [RoomCategory.Docking]: 'rgba(96, 165, 250, 0.3)',
  [RoomCategory.Engineering]: 'rgba(251, 191, 36, 0.3)',
};

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { game, ui, placeRoom, selectRoom, setZoom, setCameraPosition } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(ui.zoom + delta);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / ui.zoom;
      const dy = (e.clientY - dragStart.y) / ui.zoom;
      setCameraPosition({
        x: ui.cameraPosition.x - dx / CELL_SIZE,
        y: ui.cameraPosition.y - dy / CELL_SIZE,
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle click on canvas
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const worldX = ui.cameraPosition.x + (e.clientX - rect.left - centerX) / (CELL_SIZE * ui.zoom);
    const worldY = ui.cameraPosition.y + (e.clientY - rect.top - centerY) / (CELL_SIZE * ui.zoom);

    const gridX = Math.floor(worldX);
    const gridY = Math.floor(worldY);

    // Check if clicking on an existing room
    const clickedRoom = game.rooms.find((room) => {
      const def = ROOM_DEFINITIONS[room.type];
      if (!def) return false;
      return (
        gridX >= room.position.x &&
        gridX < room.position.x + def.size.width &&
        gridY >= room.position.y &&
        gridY < room.position.y + def.size.height
      );
    });

    if (clickedRoom) {
      selectRoom(clickedRoom.id);
    } else if (ui.mode === UIMode.Build && ui.selectedBuildRoom) {
      placeRoom(ui.selectedBuildRoom, { x: gridX, y: gridY });
    } else {
      selectRoom(null);
    }
  };

  // Render rooms
  const renderRooms = () => {
    return game.rooms.map((room) => {
      const def = ROOM_DEFINITIONS[room.type];
      if (!def) return null;

      const isSelected = ui.selectedRoom === room.id;
      const isConstruction = room.constructionProgress < 100;

      return (
        <div
          key={room.id}
          className={`room-cell ${isSelected ? 'selected' : ''} ${
            room.powered ? 'powered' : 'unpowered'
          } ${isConstruction ? 'construction' : ''}`}
          style={{
            left: (room.position.x - ui.cameraPosition.x) * CELL_SIZE * ui.zoom + '50%',
            top: (room.position.y - ui.cameraPosition.y) * CELL_SIZE * ui.zoom + '50%',
            width: def.size.width * CELL_SIZE * ui.zoom,
            height: def.size.height * CELL_SIZE * ui.zoom,
            transform: 'translate(-50%, -50%)',
            background: CATEGORY_COLORS[def.category],
            fontSize: `${10 * ui.zoom}px`,
          }}
          title={`${def.name}${isConstruction ? ` (${room.constructionProgress.toFixed(0)}%)` : ''}`}
        >
          {def.name.substring(0, 3)}
        </div>
      );
    });
  };

  // Render crew positions
  const renderCrew = () => {
    return game.crew
      .filter((c) => c.isAlive)
      .map((crew) => (
        <div
          key={crew.id}
          style={{
            position: 'absolute',
            left: (crew.position.x - ui.cameraPosition.x) * CELL_SIZE * ui.zoom + '50%',
            top: (crew.position.y - ui.cameraPosition.y) * CELL_SIZE * ui.zoom + '50%',
            width: 6 * ui.zoom,
            height: 6 * ui.zoom,
            background: crew.mood > 50 ? '#4ade80' : '#f87171',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          title={crew.name}
        />
      ));
  };

  // Render grid
  const renderGrid = () => {
    if (!ui.showGrid) return null;

    const gridLines: React.ReactNode[] = [];
    const visibleRange = 20;

    for (let i = -visibleRange; i <= visibleRange; i++) {
      // Vertical lines
      gridLines.push(
        <div
          key={`v${i}`}
          style={{
            position: 'absolute',
            left: (i - ui.cameraPosition.x) * CELL_SIZE * ui.zoom + '50%',
            top: -visibleRange * CELL_SIZE * ui.zoom + '50%',
            width: 1,
            height: visibleRange * 2 * CELL_SIZE * ui.zoom,
            background: 'rgba(42, 42, 58, 0.5)',
          }}
        />
      );

      // Horizontal lines
      gridLines.push(
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: -visibleRange * CELL_SIZE * ui.zoom + '50%',
            top: (i - ui.cameraPosition.y) * CELL_SIZE * ui.zoom + '50%',
            width: visibleRange * 2 * CELL_SIZE * ui.zoom,
            height: 1,
            background: 'rgba(42, 42, 58, 0.5)',
          }}
        />
      );
    }

    return gridLines;
  };

  return (
    <div
      ref={containerRef}
      className="game-canvas"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      style={{ cursor: isDragging ? 'grabbing' : ui.mode === UIMode.Build ? 'crosshair' : 'default' }}
    >
      {renderGrid()}
      {renderRooms()}
      {renderCrew()}

      {/* Build preview */}
      {ui.mode === UIMode.Build && ui.selectedBuildRoom && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'var(--bg-secondary)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            color: 'var(--accent-blue)',
          }}
        >
          Placing: {ROOM_DEFINITIONS[ui.selectedBuildRoom]?.name || ui.selectedBuildRoom}
        </div>
      )}

      {/* Zoom indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          background: 'var(--bg-secondary)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          color: 'var(--text-muted)',
        }}
      >
        {(ui.zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};
