"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date>(
    date ? new Date(date) : new Date(),
  );

  return (
    <div className={cn(className, "flex flex-col gap-3")}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={"w-full justify-between font-normal h-12 cursor-pointer"}
          >
            {internalDate
              ? internalDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-full overflow-hidden p-0 rounded-2xl border-2 border-neutral-100 shadow-lg"
          align="start"
        >
          <Calendar
            mode="single"
            selected={internalDate}
            captionLayout="dropdown"
            disabled={(date) => date <= new Date()}
            className="p-6 rounded-2xl border-2 border-neutral-200 shadow-xl"
            classNames={{
              root: "p-6",
              months: "flex flex-col gap-6 ",
              month: "flex flex-col gap-6",
              caption: "flex justify-center items-center pb-6 pt-2 relative",
              caption_label: "hidden",
              dropdowns: "flex items-center gap-3 mb-4 ",
              dropdown:
                "cursor-pointer pup-body-sm-500 text-neutral-black bg-neutral-100 rounded-xl px-3 py-2 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm",
              nav: "absolute inset-x-0 top-5 px-8 flex w-full items-center justify-between gap-1 rdp-nav",
              nav_button:
                "cursor-pointer h-10 w-10 flex items-center justify-center rounded-xl border-2 border-neutral-200 hover:border-primary-orange hover:text-primary-orange hover:bg-primary-orange/5 transition-all duration-200 shadow-sm bg-white",
              nav_button_previous: "",
              nav_button_next: "",
              table: "w-full border-collapse",
              head_row: "flex gap-1 mb-3",
              head_cell:
                "w-11 h-11 flex items-center justify-center text-neutral-500 pup-body-sm-400 font-medium rounded-lg",
              row: "flex gap-1 mt-2",
              cell: "w-11 h-11 flex items-center justify-center relative rounded-xl",
              day: "w-11 h-11 flex items-center justify-center rounded-xl pup-body-sm-400 text-neutral-black font-medium hover:bg-primary-orange/10 hover:text-primary-orange hover:shadow-sm transition-all duration-200 cursor-pointer border border-transparent",
              day_selected:
                "bg-primary-orange! text-white! hover:bg-primary-orange hover:text-white! shadow-md border-2 border-primary-orange/50 font-semibold rounded-xl",
              day_today:
                "ring-2 ring-primary-orange ring-offset-2 ring-offset-background text-primary-orange font-semibold border-2 border-primary-orange bg-primary-orange/10",
              day_disabled:
                "text-neutral-300 cursor-not-allowed hover:bg-transparent hover:text-neutral-300 opacity-60",
              day_outside: "text-neutral-light-grey opacity-50",
              day_range_middle:
                "bg-primary-orange/20 border border-primary-orange/30",
              day_hidden: "invisible",
            }}
            onSelect={(date) => {
              setInternalDate(date || new Date());
              setDate(date?.toISOString() || new Date().toISOString());
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
