function mouselog(event) {
    text.value += `${event.type === 'mouseover' && event.target.id === 'child' ? 'center' : 'out'}\n`.replace(/(:|^)(\d\D)/, '$10$2');
    text.scrollTop = text.scrollHeight;
}
