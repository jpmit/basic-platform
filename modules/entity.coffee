ControlMixin = require './mixin-local-control'
RigidBody    = require './mixin-rigid-body'
assign       = require 'lodash.assign'
mixin        = require 'lodash.mixin'
uuid         = require 'node-uuid'


class Entity
  constructor: (obj) ->
    @id = uuid.v4()
    assign this, obj

    # mixin rigid body physics
    rigid = new RigidBody obj
    assign this, rigid
    mixin this, rigid

    # mixin keyboard/mouse control
    control = new ControlMixin()
    assign this, control
    mixin this, control


  step: (level, dt) -> @stepRigidBody level, dt


module.exports = Entity
