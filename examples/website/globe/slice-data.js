const GROUP_SIZE = 2500;
const SEC_PER_DAY = 60 * 60 * 24;

// Divide data into smaller groups, and render one layer for each group.
// This allows us to cheaply cull invisible flights by turning layers off and on.
export function sliceData(data) {
  const groups = [];
  if (!data) {
    return groups;
  }
  let group;

  for (let i = 0; i < data.length; i++) {
    const day = data[i];
    // Join multiple days together into a continuous animation
    const offset = SEC_PER_DAY * i;
    group = null;

    for (const row of day.flights) {
      row.time1 += offset;
      row.time2 += offset;

      if (!group || group.flights.length >= GROUP_SIZE) {
        group = {
          date: day.date,
          startTime: row.time1,
          endTime: row.time2,
          flights: []
        };
        groups.push(group);
      }
      group.flights.push(row);
      group.startTime = Math.min(group.startTime, row.time1);
      group.endTime = Math.max(group.endTime, row.time2);
    }
  }

  return groups;
}

// Look up the real date time from our artifical timestamp
export function getDate(data, t) {
  const index = Math.min(data.length - 1, Math.floor(t / SEC_PER_DAY));
  const date = data[index].date;
  const timestamp = new Date(`${date} 00:00:00+0:00`).getTime() + (t % SEC_PER_DAY) * 1000;
  return new Date(timestamp);
}
