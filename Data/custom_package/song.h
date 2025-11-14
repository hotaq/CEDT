#ifndef __SONG_H__
#define __SONG_H__

#include <iostream>
#include <queue>
#include <string>
#include <vector>
#include "priority_queue.h"

using namespace std;

class Song {
  public:
    std::string artist, title;
    int count;

    Song() { }
    Song(const Song &s) : artist(s.artist), title(s.title), count(s.count) { }
    Song(std::string artist,std::string title,int count) :
        artist(artist), title(title), count(count) { }

    friend std::ostream& operator<<(std::ostream &out,const Song &s) {
      return out << "Artist: " << s.artist << " Title: " << s.title << " count: " << s.count;
    }
};



class compareAT {
  public:
    bool operator()(const Song &a, const Song &b) const {
        if (a.artist != b.artist)
            return a.artist > b.artist;
        if (a.title != b.title)
            return a.title > b.title;
        return a.count > b.count;
    }
};


class compareCT {
  public:
    bool operator()(const Song &a, const Song &b) const {
        if (a.count != b.count)
            return a.count < b.count;   
        if (a.artist != b.artist)
            return a.artist > b.artist; 
        return a.title > b.title;
    }
};


CP::priority_queue<Song, compareAT> pq1;
CP::priority_queue<Song, compareCT> pq2;

#endif