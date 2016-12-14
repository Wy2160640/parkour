Ext.define('MainHub.view.flowcell.LoadFlowcellWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.load-flowcell-window',

    requires: ['MainHub.view.flowcell.PoolInfoWindow'],

    config: {
        control: {
            '#': {
                boxready: 'onWindowReady',
                beforeclose: 'onWindowClose'
            },
            '#sequencerField': {
                change: 'changeSequencer'
            },
            '#poolsFlowcell': {
                render: 'initializePoolDragZone',
                itemcontextmenu: 'showAdditionalInformationMenu'
            },
            '#loadingConcentrationField': {
                change: 'changeLoadingConcentration',
                clear: 'clearLoadingConcentration'
            },
            '#flowcellResultGrid': {
                select: 'selectLane',
                itemcontextmenu: 'showUnloadLaneMenu'
            },
            '#saveBtn': {
                click: 'saveFlowcell'
            }
        }
    },

    onWindowReady: function () {
        Ext.getStore('poolsStore').load();
    },

    onWindowClose: function () {
        Ext.getCmp('poolsFlowcell').dragZone.destroy();
    },

    changeSequencer: function(cb, newValue, oldValue) {
        var me = this,
            lanes = Ext.getCmp('lanes'),
            lanesStore = Ext.getStore('lanesStore'),
            loadingConcentrationField = Ext.getCmp('loadingConcentrationField');

        lanes.removeAll(true);
        lanesStore.removeAll();
        loadingConcentrationField.fireEvent('clear', loadingConcentrationField);

        // If HiSeq2500 has been selected, create 8 lanes
        if (newValue == 5) {
            for (var i = 1; i < 9; i++) {
                lanes.add({
                    cls: 'lane',
                    html: 'Lane ' + i,
                    id: 'lane' + i,
                    width: 82,
                    listeners: {
                        render: me.initializeLaneDropZone
                    }
                });
            }
        } else {
            lanes.add({
                cls: 'lane',
                html: 'Lane 1',
                id: 'lane1',
                width: 145,
                listeners: {
                    render: me.initializeLaneDropZone
                }
            });
        }

        // TODO@me: Update Loaded Total
    },

    changeLoadingConcentration: function(fld, value) {
        var lane = Ext.get(fld.activeLane),
            lanesStore = Ext.getStore('lanesStore');

        if (lane) {
            var record = lanesStore.findRecord('lane', lane.id);
            record.set('loadingConcentration', value);
        }
    },

    clickLane: function(e) {
        var laneId = this.id,
            wnd = this.component.up('window'),
            grid = Ext.getCmp('flowcellResultGrid'),
            poolsStore = Ext.getStore('poolsStore'),
            lanesStore = Ext.getStore('lanesStore');

        if ($(this.dom).find('.lane-loaded').length === 1) {
            var record = lanesStore.findRecord('lane', laneId);

            // Highlight an active lane in the result grid
            grid.getSelectionModel().select(lanesStore.indexOf(record));

            // Disable Loading Concentration field and set its value
            wnd.getController().updateConcentrationField(record);
        } else {
            grid.getSelectionModel().deselectAll();
            Ext.getCmp('loadingConcentrationField').fireEvent('clear', loadingConcentrationField);
        }
    },

    selectLane: function (grid, record) {
        this.updateConcentrationField(record);
    },

    updateConcentrationField: function (record) {
        var field = Ext.getCmp('loadingConcentrationField');

        field.setDisabled(false);
        field.activeLane = record.get('lane');

        if (record.get('loadingConcentration') !== '') {
            field.setValue(record.get('loadingConcentration'));
        } else {
            field.reset();
        }
    },

    initializePoolDragZone: function(v) {
        v.dragZone = Ext.create('Ext.dd.DragZone', v.getEl(), {
            onBeforeDrag: function(data, e) {
                var record = v.getStore().getAt(e.recordIndex);
                return !record.isDisabled();
            },

            getDragData: function(e) {
                var sourceEl = $(e.item).find('td div')[0], d;
                if (sourceEl) {
                    d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return (v.dragData = {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d,
                        poolData: v.getStore().getAt(e.recordIndex).data
                    });
                }
            },

            getRepairXY: function() {
                return this.dragData.repairXY;
            }
        });
    },

    initializeLaneDropZone: function(v) {
        // Initialize 'click' event
        v.el.on('click', this.up('window').getController().clickLane);

        function isLoaded(lane, store) {
            return store.findRecord('lane', lane) !== null;
        }

        function isReadLengthOK(pool, lanesStore, poolsStore) {
            if (lanesStore.getCount() > 0) {
                var poolInResultId = lanesStore.getAt(0).get('pool'),
                    poolInResultRecord = poolsStore.findRecord('id', poolInResultId);

                if (poolInResultRecord.get('readLength') != pool.get('readLength')) {
                    return false;
                }
            }
            return true;
        }

        function isTargetingSelf(targetLane, pool, store) {
            var ids = [];
            store.each(function(record) {
                if (record.get('pool') == pool.get('id')) {
                    ids.push(record.get('lane'));
                }
            });
            return ids.indexOf(targetLane) !== -1;
        }

        v.dropZone = Ext.create('Ext.dd.DropZone', v.el, {
            getTargetFromEvent: function(e) {
                return e.getTarget();
            },

            onNodeOver : function(target, dd, e, data) {
                var lanesStore = Ext.getStore('lanesStore'),
                    poolsStore = Ext.getStore('poolsStore'),
                    pool = poolsStore.findRecord('name', data.poolData.name),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    proto = Ext.dd.DropZone.prototype;
                return (!isLoaded(laneId, lanesStore) && isReadLengthOK(pool, lanesStore, poolsStore)) ? proto.dropAllowed : proto.dropNotAllowed;
            },

            onNodeDrop : function(target, dd, e, data) {
                var poolData = data.poolData,
                    poolsStore = Ext.getStore('poolsStore'),
                    lanesStore = Ext.getStore('lanesStore'),
                    pool = poolsStore.findRecord('name', poolData.name),
                    poolSize = pool.get('size'),
                    laneId = $(target).attr('id').replace('-innerCt', ''),
                    laneName = $(target).text(),
                    sequencerId = Ext.getCmp('sequencerField').getValue(),
                    laneCapacity = Ext.getStore('sequencersStore').findRecord('id', sequencerId).get('laneCapacity'),
                    $resultTotalItem = $('#flowcell-result-total'),
                    loadedTotal = parseInt($resultTotalItem.text());

                // If a target lane is not loaded
                if (!isLoaded(laneId, lanesStore)) {
                    // Is the Read Length the same for all pools
                    if (isReadLengthOK(pool, lanesStore, poolsStore)) {
                        //
                        var diff = poolSize - loadedTotal, loaded;
                        if (diff > laneCapacity) {
                            loaded = laneCapacity
                        } else {
                            loaded = diff
                        }

                        // Load the pool on a lane
                        lanesStore.add({
                            pool: pool.get('id'),
                            poolName: pool.get('name'),
                            lane: laneId,
                            laneName: laneName,
                            loaded: loaded
                        });

                        // Update Loaded Total
                        $resultTotalItem.text(lanesStore.sum('loaded'));

                        // Disable the pool
                        if (lanesStore.sum('loaded') == poolSize) pool.setDisabled(true);

                        Ext.fly(target).addCls('lane-loaded');
                        return true;
                    } else {
                        Ext.ux.ToastMessage('Read Length must be the same for all pools on a flowcell.', 'warning');
                    }
                }
                // If a target lane is loaded
                else {
                    // If a target lane and the loaded pool's lane are not the same
                    if (!isTargetingSelf(laneId, pool, lanesStore)) {
                        Ext.ux.ToastMessage(laneName + ' is already loaded. Please unload it and try again.', 'warning');
                    }
                }

                return false;
            }
        });
    },

    showAdditionalInformationMenu: function(grid, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Show Additional Information',
                iconCls: 'x-fa fa-info',
                handler: function() {
                    Ext.create('MainHub.view.flowcell.PoolInfoWindow', {
                        title: record.get('name'),
                        poolId: record.get('id')
                    }).show();
                }
            }]
        }).showAt(e.getXY());
    },

    showUnloadLaneMenu: function(grid, record, item, index, e) {
        var me = this;
        e.stopEvent();
        Ext.create('Ext.menu.Menu', {
            items: [{
                text: 'Unload Lane',
                iconCls: 'x-fa fa-eraser',
                handler: function() {
                    me.unloadLane(grid.getStore(), record);
                }
            }]
        }).showAt(e.getXY());
    },

    unloadLane: function(store, record) {
        var loadingConcentrationField = Ext.getCmp('loadingConcentrationField');
        loadingConcentrationField.fireEvent('clear', loadingConcentrationField);
        Ext.fly(record.get('lane') + '-innerCt').removeCls('lane-loaded');
        store.remove(record);

        // TODO@me: Update Loaded Total
    },

    clearLoadingConcentration: function(fld) {
        fld.setDisabled(true);
        fld.activeLane = '';
        fld.suspendEvent('change');
        fld.setValue('');
        fld.resumeEvent('change');
    },

    saveFlowcell: function(btn) {
        var resultGrid = Ext.getCmp('flowcellResultGrid'),
            resultStore = resultGrid.getStore(),
            lanes = Ext.getCmp('lanes').items.items;

        if (resultStore.getCount() == lanes.length) {
            // debugger;
        } else {
            Ext.ux.ToastMessage('All lanes must be loaded.', 'warning');
        }
    }
});
