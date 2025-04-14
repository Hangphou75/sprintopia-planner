
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFilters } from "./EventFilters";
import { WorkoutList } from "./WorkoutList";
import { WeekView } from "./WeekView";
import { Event, ThemeOption } from "../types";

interface EventsTabViewProps {
  events: Event[];
  filteredWorkouts: Event[];
  selectedTheme: string | null;
  sortOrder: "asc" | "desc";
  themeOptions: ThemeOption[];
  themeIcons: { [key: string]: any };
  selectedDate: Date | null;
  onEventClick: (event: Event) => void;
  onDuplicateWorkout: (event: Event) => void;
  onDeleteWorkout: (event: Event) => void;
  onEditWorkout: (event: Event) => void;
  onSelectDate: (date: Date) => void;
  onThemeChange: (theme: string | null) => void;
  onSortOrderChange: () => void;
  userRole?: string;
}

export const EventsTabView = ({
  events,
  filteredWorkouts,
  selectedTheme,
  sortOrder,
  themeOptions,
  themeIcons,
  selectedDate,
  onEventClick,
  onDuplicateWorkout,
  onDeleteWorkout,
  onEditWorkout,
  onSelectDate,
  onThemeChange,
  onSortOrderChange,
  userRole
}: EventsTabViewProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Vue liste</TabsTrigger>
          <TabsTrigger value="week">Vue semaine</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-sm text-left">Liste des séances</h2>
            <EventFilters 
              selectedTheme={selectedTheme} 
              sortOrder={sortOrder} 
              themeOptions={themeOptions} 
              onThemeChange={onThemeChange} 
              onSortOrderChange={onSortOrderChange} 
            />
          </div>

          <WorkoutList 
            filteredWorkouts={filteredWorkouts} 
            themeOptions={themeOptions} 
            themeIcons={themeIcons} 
            onEventClick={onEventClick} 
            onDuplicateWorkout={onDuplicateWorkout} 
            onDeleteWorkout={onDeleteWorkout} 
            onEditWorkout={onEditWorkout} 
            userRole={userRole} 
          />
        </TabsContent>

        <TabsContent value="week">
          <WeekView 
            events={events} 
            currentDate={selectedDate ?? new Date()} 
            onDateChange={onSelectDate} 
            onEventClick={onEventClick} 
            themeOptions={themeOptions} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
