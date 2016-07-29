/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
define(['../caleydo_core/data', 'd3', 'jquery', '../caleydo_core/event', '../caleydo_d3/selectioninfo', './board_OLD', '../caleydo_core/idtype', './toolbar', 'bootstrap', 'font-awesome'],
         function (data, d3, $, events, selectionInfo, boards, idtypes, links) {
  'use strict';
  var info = selectionInfo.create(document.getElementById('selectioninfo'));
  var board = boards.create(document.getElementById('board'));

  $(document).keydown(boards.digestKeyCode);

  function splitTables(items) {
    var r = [];
    items.forEach(function (entry) {
      if (entry.desc.type === 'table') {
        r.push.apply(r, entry.cols());
      }
    });
    return r;
  }

  function toType(desc) {
    if (desc.type === 'vector') {
      return desc.value.type === 'categorical' ? 'stratification' : 'numerical';
    }
    return desc.type;
  }

  data.list().then(function (items) {
    items = items.concat(splitTables(items));
    items = items.filter(function (d) {
      return d.desc.type !== 'table' && d.desc.type !== 'stratification';
    });
    var $base = d3.select('#blockbrowser table tbody');
    var $rows = $base.selectAll('tr').data(items);
    $rows.enter().append('tr').html(function (d) {
      return '<th>' + d.desc.name + '</th><td>' + toType(d.desc) + '</td><td>' +
        d.idtypes.map(function (d) { return d.name; }).join(', ') + '</td><td>' + d.dim.join(' x ') + '</td>';
    }).attr('draggable', true)
      .on('dragstart', function (d) {
        var e = d3.event;
        e.dataTransfer.effectAllowed = 'copy'; //none, copy, copyLink, copyMove, link, linkMove, move, all
        e.dataTransfer.setData('text/plain', d.desc.name);
        e.dataTransfer.setData('application/json', JSON.stringify(d.desc));
        var p = JSON.stringify(d.persist());
        e.dataTransfer.setData('application/caleydo-data-item', p);
        //encode the id in the mime type
        e.dataTransfer.setData('application/caleydo-data-item-' + p, p);
        board.currentlyDragged = d;
      });
  });
});
