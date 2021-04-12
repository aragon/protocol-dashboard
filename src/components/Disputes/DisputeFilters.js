import React from 'react'
import { DropDown, DateRangePicker, GU } from '@aragon/ui'

const DisputeFilters = ({
  phaseTypes,
  statusTypes,
  dateRangeFilter,
  subjects,
  selectedSubject,
  phaseFilter,
  statusFilter,
  onDateRangeChange,
  onPhaseChange,
  onStatusChange,
  onSubjectChange
}) => {
  return (
    <div
      css={`
        height: ${8 * GU}px;
        display: grid;
        grid-template-columns: auto auto auto auto;
        grid-gap: ${1 * GU}px;
        align-items: center;
        padding: 0 ${3 * GU}px;
      `}
    >
      <DropDown
        header="Phase"
        placeholder="Phase"
        selected={phaseFilter}
        onChange={onPhaseChange}
        items={phaseTypes}
      />
      <DropDown
        header="Status"
        placeholder="Status"
        selected={statusFilter}
        onChange={onStatusChange}
        items={statusTypes}
      />
      <DropDown
        header="Creator of the dispute"
        placeholder="Subject"
        selected={selectedSubject}
        onChange={onSubjectChange}
        items={subjects}
      />
      <DateRangePicker
        startDate={dateRangeFilter.start}
        endDate={dateRangeFilter.end}
        onChange={onDateRangeChange}
      />
    </div>
  )
}

export default DisputeFilters
