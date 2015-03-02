#!/bin/env ruby
require 'optparse'

class Point 
    def initialize( x, y)
	@x = x
	@y = y
    end

    def to_s
	"#{@x} #{@y}"
    end

    def to_js
	"{#{@x}, #{@y}}"
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

    def initialize( max_height, scale = 1 )
	@scale = scale
	@max_height = max_height
    end

    def fill( height )
	coords = Array.new()
	volume = 0
	if height < 6
	    0.step(height, 0.01) do |h|
		volume += (Math::PI*((2.75 - 0.194444*h)**2))*0.01 / @scale
		coords.push(Point.new(volume, h))
	    end
	else
	    0.step(6,0.01) do |h|
		volume += (Math::PI*((2.75 - 0.194444*h)**2))*0.01 / @scale
		coords.push(Point.new(volume, h))
	    end	
	    6.01.step(height,0.01) do |h|
		volume += Math::PI*0.01 / @scale
		coords.push(Point.new(volume, h<@max_height?h:@max_height))
	    end
	end
	return coords
    end
end

opts = OptionParser.new
opts.banner = "filling_erlenmeyer.rb [options]"
scale = 10
opts.on('--scale [SCALE]', Float, "Scale the output values with SCALE, default is 10") do |sc|
    scale = sc
end
height = 0
opts.on('--height HEIGHT', Float, "Fill bottle to HEIGHT") do |h|
    height = h
end
opts.on('-h', '--help', 'Show this message') do
    puts opts
end
opts.parse(ARGV)

bottle = Erlenmeyer.new(7.5, scale)
bottle.fill(height).each { |p| puts p.rev_s }


