#!/bin/env ruby
require 'optparse'

class Point 

    attr_reader :x, :y

    def initialize( x, y)
	@x = x
	@y = y
    end

    def to_s
	"#{@x} #{@y}"
    end

    def to_js
	"[#{@x}, #{@y}]"
    end
end

class Bottle
    def initialize( scale = 1 )
	@scale = scale
	@max_height = 0
    end

    def fill( height )

    end
end

class Erlenmeyer < Bottle

    attr_writer :speed

    def initialize( max_height, scale = 1 )
	@scale = scale
	@max_height = max_height
	@speed = 25;
    end


    def t( volume ) 
	return volume/@speed
    end

    def fill( height )
	coords = Array.new()
	volume = 0
	0.step(0.2, 0.1) do |h|
	    puts h
	    volume += (Math::PI*((2.3+3*h)**2))*0.1
	    coords.push(Point.new(h, volume))
	end
	aux = 1.9/5.8
	0.3.step(6.0,0.1) do |h|
	    volume += (Math::PI*((2.9 - aux*h)**2))*0.1
	    coords.push(Point.new(h, volume))
	end	
	6.1.step(height,0.1) do |h|
	    volume += Math::PI*(1.0**2)*0.1
	    coords.push(Point.new(h<@max_height?h:@max_height, volume))
	end
	return coords
    end
end

opts = OptionParser.new
opts.banner = "filling_erlenmeyer.rb [options]"
scale = 10000
speed = 30
opts.on('--scale [SCALE]', Float, "Scale the output values with SCALE, default is 10") do |sc|
    scale = sc
end
opts.on('--speed [SPEED]', Float, "The speed of the running water, default is 30") do |sp|
    speed = sp
end
opts.on('-h', '--help', 'Show this message') do
    puts opts
end
offset = 0
opts.on('--offset [OFFSET]', Float, "Add OFFSET to the height of the water") do |os|
    offset=os
end
opts.parse(ARGV)

height = 7.5
bottle = Erlenmeyer.new(7.5, scale)
values = Array.new()
key_times = Array.new()
bottle.speed = speed
path = "M 0 80"
bottle.fill(height).each do |p|  
    path += " L #{p.y} #{80-(p.x*10)}"
end

puts path
