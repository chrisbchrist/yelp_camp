
function what() {
    console.log("What");
}

function formatDate(isoDate) {
      const month = isoDate.toLocaleString('en-us', { month: 'short' });
      const monthDate = isoDate.getDate();
      const hours = isoDate.getHours();
      const minutes = isoDate.getMinutes().length < 2 ? "0" + isoDate.getMinutes() : isoDate.getMinutes();
      
      return month + " " + monthDate + ", " + hours + ":" + minutes; 
  }
