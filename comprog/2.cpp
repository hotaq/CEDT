    #include<iostream>
    #include<map>
    using namespace std;

    int main(){
        int n;
        cin >> n;
        cin.ignore();  
        map<string,vector<string>> name_music;
        for(int i = 0; i < n; i++){
            string z;
            getline(cin, z);

            int pos = z.find(',');
            if (pos == string::npos) continue; 

            string name = z.substr(0,pos);
            string music = z.substr(pos+1);
            name_music[name].push_back(music);


        }

        vector<string> song;
        string s;
        getline(cin,s);
        int idx=0;
        for(int i =0;i<s.length();i++){
            if(s[i]==','){
                song.push_back(s.substr(idx,i-idx));
                idx = i+2;
            }

        }

        if(idx < s.size()){
            song.push_back(s.substr(idx));
        }

        for(auto s:song){
            if(name_music.find(s) != name_music.end()){
                cout << s << " ->";
                for(int i =0;i<name_music[s].size();i++){
                    if(i!=name_music[s].size()-1){
                        cout << name_music[s][i] << ", ";
                    }else {
                        cout << name_music[s][i];
                    }
                }
                cout << endl;
            }else {
                cout << s << " ->" << " Not found";
                cout << endl;
            }
        }

    }
