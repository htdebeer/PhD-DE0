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

    def initialize( max_height, scale = 1 )
	@scale = scale
	@max_height = max_height
    end

    def fill( height )
	coords = Array.new()
	volume = 0
	0.step(2, 1) do |h|
	    puts h
	    volume += (Math::PI*((22.5+26*h)**2))*1 / @scale
	    coords.push(Point.new(volume, h))
	end
	aux = 152/46
	3.step(60,1) do |h|
	    volume += (Math::PI*((29 - aux*h)**2))*1 / @scale
	    coords.push(Point.new(volume, h))
	end	
	61.step(height,1) do |h|
	    volume += Math::PI*100*1 / @scale
	    coords.push(Point.new(volume, h<@max_height?h:@max_height))
	end
	return coords
    end
end

opts = OptionParser.new
opts.banner = "filling_erlenmeyer.rb [options]"
scale = 10000
opts.on('--scale [SCALE]', Float, "Scale the output values with SCALE, default is 10") do |sc|
    scale = sc
end
opts.on('-h', '--help', 'Show this message') do
    puts opts
end
opts.parse(ARGV)

height = 75
bottle = Erlenmeyer.new(75, scale)
a = Array.new()
bottle.fill(height).each { |p|  a.push(p.to_js) }
puts "["
puts a.join(",\n")
puts "]"


