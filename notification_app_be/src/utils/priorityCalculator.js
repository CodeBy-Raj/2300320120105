function getWeight(type) {

  const weights = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  return weights[type] || 0;
}

function getTop10(notifications) {

  notifications.sort((a, b) => {

    const weightDiff =
      getWeight(b.Type) -
      getWeight(a.Type);

    if (weightDiff !== 0)
      return weightDiff;

    return (
      new Date(b.Timestamp) -
      new Date(a.Timestamp)
    );

  });

  return notifications.slice(0, 10);
}

module.exports = {
  getTop10
};