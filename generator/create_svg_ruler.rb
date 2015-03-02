#!/bin/env ruby

require 'optparse'

class Ruler

    attr_reader :width, :height, :cms, :x_start, :y_start

    def initialize( width, cms, x_start = 0, y_start = 0 ) 
	@width = width
	@height = cms * 10
	@cms = cms
	@x_start = x_start
	@y_start = y_start
    end

    def to_svg
	r = "<svg xmlns='http://www.w3.org/2000/svg'>\n"
	r += "  <g id='ruler' >\n"
	# rectangular shape
	r += "    <rect stroke='black' fill='none' \n"
	r += "        x='#{@x_start}' y='#{@y_start}' "
	r += "height='#{@height}' width='#{@width}' />\n"
	# mm
	r += "    <path stroke='black' fill='none' stroke-width='0.2' d='"
	x_start = @x_start + @width
	x_end = x_start - 2.5
	(@y_start+1).step(@height-1, 1) do |y_streep|
	    if y_streep % 10 != 0 and y_streep % 5 != 0
		r += "M #{x_start} #{y_streep} H #{x_end} "
	    end
	end
	r += "' />\n"
	# .5 cm
	r += "    <path stroke='black' fill='none' stroke-width='0.5' d='"
	x_start = @x_start + @width
	x_end = x_start - 4
	(@y_start+5).step(@height-5, 10) do |y_streep|
	    r += "M #{x_start} #{y_streep} H #{x_end} "
	end
	r += "' />\n"
	# cm
	r += "    <path stroke='black' fill='none' stroke-width='0.8' d='"
	x_start = @x_start + @width
	x_end = x_start - 5.5
	(@y_start+10).step(@height-10, 10) do |y_streep|
	    r += "M #{x_start} #{y_streep} H #{x_end} "
	end
	r += "' />\n"
	r += "  </g>\n"
	r += "</svg>"
	r
    end

end

start_x = 0
start_y = 0
cms = 0
width = 30

opts = OptionParser.new
opts.banner = "create_svg_ruler.rb [options]"


opts.on('-x [X]', Integer, "The x coordinate of the upper left corner of the ruler") do |x|
    start_x = x
end
opts.on('-y [Y]', Integer, "The y coordinate of the upper left corner of the ruler") do |x|
    start_y = y
end
opts.on('-w [WIDTH]', Integer, "The width in px the ruler") do |w|
    width = w
end

opts.on('-h HEIGHT', Integer, "The height in cm the ruler") do |h|
    cms = h
end

opts.on('-?', "Show this message") do
    puts opts
end
opts.parse(ARGV)

ruler = Ruler.new( width, cms, start_x, start_y  )
puts ruler.to_svg

