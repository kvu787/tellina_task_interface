// Given a json represented *merged* filesystem status, and a div id to draw
// the visualization, render the visualization there. The filesystem json
// should be of the format created by filesystem.py

function build_stdout_vis(data, div_id) {
    var init_time = true;
    var id = 0;

    var tree = d3.layout.treelist()
        .childIndent(15)
        .nodeHeight(22);

    $(div_id).empty();
    var ul = d3.select(div_id).append("ul").classed("treelist", "true");

    function render(data) {
        var items = data.lines,
            duration = 0;

        var nodeEls = ul.selectAll("li.node").data(items, function (d) {
            d.id = d.id || ++id;
            return d.id;
        })

        //entered items
        var entered = nodeEls.enter().append("li").classed("node", true)
            .style("margin-top", 0 + "px")
            .style("opacity", 0)
            .style("height", tree.nodeHeight() + "px")

        ul.selectAll("li.node").style("color", function(d) {
            if (d.hasOwnProperty("tag") && d.tag == "extra")
                return "red";
            else if (d.hasOwnProperty("tag") && d.tag == "incorrect")
                return "orange";
            else
                return "black";
        });

        ul.selectAll("li.node").style("text-decoration", function(d) {
            if (d.hasOwnProperty('tag') && d.tag == "extra")
                return "line-through";
        });

        //add text
        entered.append("span").attr("class", 'filename')
            .html(function (d) {
                return d.line;
            });

        //update position with transition: if
        nodeEls//.transition().duration(duration)
            .style("margin-top", function (d) {
                return ((d.id-1) * tree.nodeHeight()) + "px";
                })
            .style("margin-left", function (d) { return d.x + "px"; })
            .style("opacity", function (d) {
                    if (d.hasOwnProperty('tag') && d.tag == "missing")
                        return 0.3;
                    else
                        return 1;
                }
            );
        nodeEls.exit().remove();
    }

    render(data);
    $(div_id).css("height", "10px");

}

function build_fs_tree_vis(data, div_id) {

    var init_time = true;
    var id = 0;

    var tree = d3.layout.treelist()
        .childIndent(15)
        .nodeHeight(22);

    $(div_id).empty();
    var ul = d3.select(div_id).append("ul").classed("treelist", "true");

    function render(data, parent) {
        var nodes = tree.nodes(data),
            duration = 250;

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
        }

        var nodeEls = ul.selectAll("li.node").data(nodes, function (d) {
            d.id = d.id || ++id;
            return d.id;
        });
        //entered nodes
        var entered = nodeEls.enter().append("li").classed("node", true)
            .style("margin-top", parent.y +"px")
            .style("opacity", 0)
            .style("height", tree.nodeHeight() + "px")
            .on("click", function (d) {
                toggleChildren(d);
                render(data, d);
            })
            .on("mouseover", function (d) {
                d3.select(this).classed("selected", true);
            })
            .on("mouseout", function (d) {
                d3.selectAll(".selected").classed("selected", false);
            });
            
        //add arrows if it is a folder
        entered.append("span").attr("class", function (d) {
            var icon = d.children ? " glyphicon-chevron-down"
                : d._children ? "glyphicon-chevron-right" : "glyphicon-chevron-right non-visible";
            return "glyphicon " + icon;
        });
        //add icons for folder for file
        entered.append("span").attr("class", function (d) {
            // just a quick fix
            var icon = d.type == "directory" ? "glyphicon-folder-close"
                : "glyphicon-file";
            return "glyphicon " + icon;
        });

        ul.selectAll("li.node").style("color", function(d) {
            if (d.hasOwnProperty('tag') && d.tag.hasOwnProperty("extra"))
                return "red";
            // else if (d.hasOwnProperty('tag') && d.tag.hasOwnProperty('incorrect'))
            //     return "orange";
            else
                return "black";
        });

        ul.selectAll("li.node").style("text-decoration", function(d) {
            if (d.hasOwnProperty('tag') && d.tag.hasOwnProperty("extra"))
                return "line-through";
        });

        //add text
        entered.append("span").attr("class", 'filename')
            .html(function (d) { return d.name; });
        entered.append("span").attr("class", 'sup')
            .html(function (d) {
                if (d.hasOwnProperty('tag') && (d.tag.hasOwnProperty('ch_missing')
                     || d.tag.hasOwnProperty('ch_extra')
                     || d.tag.hasOwnProperty('ch_incorrect'))) {
                    return '*';
                } else {
                    return '';
                }
            });
        entered.append("span").attr("class", 'fileattributes')
            .html(function (d) {
                if (d.hasOwnProperty('attributes')) {
                    str = '';
                    for (var key in d.attributes) {
                        if (d.attributes[key].includes(':::')) {
                            values = d.attributes[key].split(':::');
                            d_attribute = values[0] + ' ⇢ ' + values[1];
                        } else {
                            d_attribute = d.attributes[key];
                        }
                        str += (key + ': ' + d_attribute);
                    }
                    if (str == '')
                        return '';
                    else
                        return '(' + str + ')';
                    return str;
                } else {
                    return '';
                }
            });
        //update caret direction
        nodeEls.select("span").attr("class", function (d) {
            var icon = d.children ? " glyphicon-chevron-down"
                : d._children ? "glyphicon-chevron-right" : "glyphicon-chevron-right non-visible";
            return "glyphicon " + icon;
        });
        // make the glyphicon smaller, and align cneter
        nodeEls.select("span").style("font-size", "60%");
        nodeEls.select("span").style("vertical-align", "40%");

        nodeEls.classed('correct_select', function(d) {
            return d.hasOwnProperty('tag') && !d.tag.hasOwnProperty('missing')
            && ((!d.tag.hasOwnProperty('selected')
                 && d.tag.hasOwnProperty('to_select'))
            || d.tag.selected === 0);
        })

        nodeEls.classed('extra_select', function(d) {
            return d.hasOwnProperty('tag') && !d.tag.hasOwnProperty('missing')
            && (d.tag.hasOwnProperty('selected') && d.tag.selected === 1);
        })

        // there are two different missed selections:
        // 1. a file to be selected is not selected by the issued command
        // 2. a file to be selected is missing from the current directory \
        // (likely caused by accidental deletion)
        nodeEls.classed('miss_select', function(d) {
            return d.hasOwnProperty('tag') && d.tag.hasOwnProperty('to_select')
            && (d.tag.hasOwnProperty('missing')
            || (d.tag.hasOwnProperty('selected') && d.tag.selected === -1));
        })

        //update position with transition: if 
        nodeEls//.transition().duration(duration)
            .style("margin-top", function (d) {
                return (d.y - tree.nodeHeight()) + "px";
            })
            .style("margin-left", function (d) { return d.x + "px"; })
            .style("opacity", function (d) {
                    if (d.hasOwnProperty('tag') && d.tag.hasOwnProperty("missing"))
                        return 0.3;
                    else
                        return 1;
                }
            );
        nodeEls.exit().remove();
    }

    render(data, data);

    // collapse the directory if it is the top level non-modified field
    if (init_time) {
        ul.selectAll("li.node").each(function(d, i) {
            // decide which folders to hide
            if (!(d.hasOwnProperty('tag') && (d.tag.hasOwnProperty('ch_missing')
                || d.tag.hasOwnProperty('ch_extra')
                || d.tag.hasOwnProperty('ch_incorrect')))) {
                if (d.name != 'website') {
                    var onClickFunc = d3.select(this).on("click");
                    onClickFunc.apply(this, [d, i]);
                }
            }
        });
        init_time = false;
    }
}
