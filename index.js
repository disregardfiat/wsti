const { readFile, writeFile } = require('fs-extra');
const location = process.argv[2] || 'input.txt';
const debug = process.argv[3] || false
let graph
// Read the file
readFile('./' + location, 'ascii', (err, data) => {
    if(err)console.log(err)
    else {
        if (data.split(':')[1]){ //clean input data assuming file contains "Graph:" such as in the documentation
            graph = new Graph(data.split(':')[1])
        } else { //assuming clean CSV
            graph = new Graph(data)
        }
        generateOutput()
    }
})

//build class graph 
class Graph {
    constructor(data) {
        let edges = data.split(',')
        this.nodes = {}
        for (var i = 0; i < edges.length; i++){
            const distance = parseInt(edges[i].replace(/[a-zA-Z\s+]/g, '')) //whitespace cleaning
            let nodes = edges[i].replace(/\s+/g, '')
            let from = nodes.substr(0,1)
            let to = nodes.substr(1,1)
            if (!this.nodes[from]){
                this.nodes[from] = {[to]:distance}
            } else {
                this.nodes[from][to] = distance
            }
        }
        if(debug)console.log('Graph:', this.nodes)
    }
    findDistance(arr){
        let distance = 0
        for (var i = 0; i < arr.length - 1; i++){
            if(this.nodes[arr[i]][arr[i + 1]]){
                distance += this.nodes[arr[i]][arr[i + 1]]
            } else {
                distance = 'NO SUCH ROUTE'
                break;
            }
        }
        return distance
    }
    findTripsWithMaxStops(from, to, max){
        let trips = []
        let maybes = []
        for (var i = 0; i < max; i++){
            let until = maybes.length
            if(!until){ //initial search
                for(var key in Object.keys(this.nodes[from])){
                    maybes.push(Object.keys(this.nodes[from])[key])
                }
            } else {
                for (var j = 0; j < until; j++){ //build paths, exhaustive
                    for(key in Object.keys(this.nodes[maybes[j].substr(-1,1)])){
                        maybes.push(maybes[j] + Object.keys(this.nodes[maybes[j].substr(-1,1)])[key])
                    }
                }
            }
            for (var item in maybes){ //test for completion
                if (maybes[item].substr(-1,1) == to){
                        trips.push(from + maybes.splice(item,1))
                        until -= 1
                }
            }
            maybes.splice(0, until)
        }
        if(debug)console.log({trips}, [...new Set(trips)])
        return [...new Set(trips)]
    }
    findTripsWithExactlyStops(from, to, stops){
        let trips = []
        let maybes = []
        for (var i = 0; i < stops; i++){
            let until = maybes.length
            if(!until){ //initial search
                for(var key in Object.keys(this.nodes[from])){
                    maybes.push(Object.keys(this.nodes[from])[key])
                }
            } else {
                for (var j = 0; j < until; j++){ //build paths, exhaustive
                    for(key in Object.keys(this.nodes[maybes[j].substr(-1,1)])){
                        maybes.push(maybes[j] + Object.keys(this.nodes[maybes[j].substr(-1,1)])[key])
                    }
                }
            }
            maybes.splice(0, until)
        }
        for (var item in maybes){ //test for completion
                if (maybes[item].substr(-1,1) == to){
                        trips.push(from + maybes.splice(item,1))
                }
            }
        if(debug)console.log({trips})
        return trips
    }
    findShortestRoute(from, to){
        let options = this.findTripsWithMaxStops(from, to, Object.keys(this.nodes).length)
        let shortest = Number.MAX_SAFE_INTEGER, route
        for (var path in options){
            const test = this.findDistance(options[path].split(''))
            if(test < shortest){
                shortest = test
                route = options[path]
            }
        }
        if(debug)console.log({route, shortest})
        return shortest
    }
    findRoutesWithDistanceLessThan(from, to, max, prune){
        let options = this.findTripsWithMaxStops(from, to, Object.keys(this.nodes).length * parseInt(prune))
        let routes = []
        for (var path in options){
            const test = this.findDistance(options[path].split(''))
            if(test <= max){
                routes.push(options[path])
            }
        }
        if(debug)console.log({routes})
        return routes
    }
}

function generateOutput() {
//The distance of the route A-B-C.
let o1 = 'Output #1: ' + graph.findDistance(['A','B','C'])
//The distance of the route A-D.
let o2 = 'Output #2: ' + graph.findDistance(['A','D'])
//The distance of the route A-D-C.
let o3 = 'Output #3: ' + graph.findDistance(['A','D','C'])
//The distance of the route A-E-B-C-D.
let o4 = 'Output #4: ' + graph.findDistance(['A','E','B','C','D'])
//The distance of the route A-E-D.
let o5 = 'Output #5: ' + graph.findDistance(['A','E','D'])
//The number of trips starting at C and ending at C with a maximum of 3 stops.  In the sample data below, there are two such trips: C-D-C (2 stops). and C-E-B-C (3 stops).
let o6 = 'Output #6: ' + graph.findTripsWithMaxStops('C', 'C', 3).length
//The number of trips starting at A and ending at C with exactly 4 stops.  In the sample data below, there are three such trips: A to C (via B,C,D); A to C (via D,C,D); and A to C (via D,E,B).
let o7 = 'Output #7: ' + graph.findTripsWithExactlyStops('A', 'C', 4).length
//The length of the shortest route (in terms of distance to travel) from A to C.
let o8 = 'Output #8: ' + graph.findShortestRoute('A', 'C')
//The length of the shortest route (in terms of distance to travel) from B to B.
let o9 = 'Output #9: ' + graph.findShortestRoute('B', 'B')
//The number of different routes from C to C with a distance of less than 30.  In the sample data, the trips are: CDC, CEBC, CEBCDC, CDCEBC, CDEBC, CEBCEBC, CEBCEBCEBC.
let o10 = 'Output #10: ' + graph.findRoutesWithDistanceLessThan('C', 'C', 30, 2).length
let output = o1 + '\n' + o2 + '\n' + o3 + '\n' + o4 + '\n' + o5 + '\n' + o6 + '\n' + o7 + '\n' + o8 + '\n' + o9 + '\n' + o10
console.log(output)
writeFile(`OP_${location}`, output, 'ascii')
console.log(`Output written to ./OP_${location}`)
}